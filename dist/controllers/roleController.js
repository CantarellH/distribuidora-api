"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.removePermissions = exports.assignPermissions = exports.createRole = exports.handleValidationErrors = exports.getRoles = void 0;
const data_source_1 = require("../config/data-source");
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
const Permission_1 = require("../models/Permission");
const express_validator_1 = require("express-validator");
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const roles = yield roleRepository.find();
        res.status(200).json(roles); // Enviar respuesta y detener
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener roles' }); // Asegúrate de que se detiene aquí
    }
});
exports.getRoles = getRoles;
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const role = roleRepository.create({ name, description });
        yield roleRepository.save(role);
        res.status(201).json(role);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createRole = createRole;
const assignPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { roleId, permissions } = req.body;
        // Validar datos de entrada
        if (!roleId || !Array.isArray(permissions)) {
            res.status(400).json({ error: 'Se requiere roleId y un array de permissions.' });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const permissionRepository = data_source_1.AppDataSource.getRepository(Permission_1.Permission);
        // Buscar el rol con sus permisos existentes
        const role = yield roleRepository.findOne({
            where: { id: roleId },
            relations: ['permissions'],
        });
        if (!role) {
            res.status(404).json({ error: 'El rol especificado no existe.' });
            return;
        }
        // Validar que los permisos existan
        const validPermissions = yield permissionRepository.findByIds(permissions);
        if (validPermissions.length !== permissions.length) {
            res.status(400).json({ error: 'Algunos permisos no son válidos.' });
            return;
        }
        // Asegurarte de que permissions no sea undefined
        role.permissions = (_a = role.permissions) !== null && _a !== void 0 ? _a : [];
        // Combinar los permisos existentes con los nuevos
        role.permissions = [...role.permissions, ...validPermissions];
        // Guardar los cambios en la base de datos
        yield roleRepository.save(role);
        res.status(200).json({ message: 'Permisos asignados correctamente.', role });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.assignPermissions = assignPermissions;
// Eliminar permisos de un rol
const removePermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { roleId, permissions } = req.body;
        if (!roleId || !Array.isArray(permissions) || permissions.some(p => typeof p !== 'number')) {
            res.status(400).json({ error: 'Se requiere roleId y un array de permissions con IDs válidos.' });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const role = yield roleRepository.findOne({
            where: { id: roleId },
            relations: ['permissions'],
        });
        if (!role) {
            res.status(404).json({ error: 'El rol especificado no existe.' });
            return;
        }
        // Asegura que permissions no sea undefined
        role.permissions = (_a = role.permissions) !== null && _a !== void 0 ? _a : [];
        // Verificar que todos los permisos a remover realmente existen y están asignados al rol
        const existingPermissionIds = new Set(role.permissions.map(p => p.id));
        const validPermissionsToRemove = permissions.filter(id => existingPermissionIds.has(id));
        // Filtrar los permisos que no están en la lista para remover
        role.permissions = role.permissions.filter(permission => !validPermissionsToRemove.includes(permission.id));
        yield roleRepository.save(role);
        res.status(200).json({ message: 'Permisos eliminados correctamente.', role });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.removePermissions = removePermissions;
const getUserPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params; // userId es un string aquí
        const userIdNumber = parseInt(userId, 10);
        if (isNaN(userIdNumber)) {
            res.status(400).json({ error: 'El ID del usuario debe ser un número.' });
            return;
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({
            where: { id: userIdNumber },
            relations: ['role', 'role.permissions'],
        });
        if (!user || !user.role) {
            res.status(404).json({ error: 'Usuario o rol no encontrado.' });
            return;
        }
        const permissions = user.role.permissions;
        res.status(200).json({ permissions });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.getUserPermissions = getUserPermissions;
