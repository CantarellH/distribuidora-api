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
exports.getAllPermissions = exports.getUserPermissions = exports.removePermissions = exports.assignPermissions = exports.createRole = exports.handleValidationErrors = exports.getRoles = void 0;
const data_source_1 = require("../config/data-source");
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
const Permission_1 = require("../models/Permission");
const RolePermission_1 = require("../models/RolePermission"); // <-- Importante
const express_validator_1 = require("express-validator");
// 1) Listar todos los roles y, de paso, obtener todos los permisos
//    (Usamos la relación con RolePermission)
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        // Incluir la relación con RolePermission y Permission
        const roles = yield roleRepository.find({
            relations: ["rolePermissions", "rolePermissions.permission", "roleModules", "roleModules.module"],
        });
        // Mapear cada rol para obtener únicamente los permisos activos
        const rolesMapped = roles.map((role) => {
            var _a, _b;
            const activePermissions = (_b = (_a = role.rolePermissions) === null || _a === void 0 ? void 0 : _a.filter((rp) => rp.isActive).map((rp) => rp.permission)) !== null && _b !== void 0 ? _b : [];
            return {
                id: role.id,
                name: role.name,
                description: role.description,
                module: role.roleModules,
                permissions: role.rolePermissions,
            };
        });
        // Obtener la lista de todos los permisos
        // Devolver roles (con permisos activos) y la lista completa de permisos
        res.status(200).json({
            roles: rolesMapped,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener roles y permisos" });
    }
});
exports.getRoles = getRoles;
// 2) Middleware genérico de validación (sin cambios)
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// 3) Crear un nuevo rol (sin cambios)
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
// 4) Asignar permisos a un rol: aquí *activamos* (o creamos) el registro
//    en la tabla 'role_permissions' con isActive = true
const assignPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permissions } = req.body;
        // Validar datos de entrada
        if (!roleId || !Array.isArray(permissions)) {
            res
                .status(400)
                .json({ error: "Se requiere roleId y un array de permissions." });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const rolePermissionRepository = data_source_1.AppDataSource.getRepository(RolePermission_1.RolePermission);
        // Verificar si el rol existe
        const role = yield roleRepository.findOneBy({ id: roleId });
        if (!role) {
            res.status(404).json({ error: "El rol especificado no existe." });
            return;
        }
        // Activar (o crear) la relación en 'role_permissions'
        for (const permissionId of permissions) {
            // Buscar si ya existe la fila en la tabla pivote
            let rp = yield rolePermissionRepository.findOne({
                where: {
                    role: { id: roleId },
                    permission: { id: permissionId },
                },
            });
            if (rp) {
                // Si ya existe, simplemente activamos isActive
                rp.isActive = true;
                yield rolePermissionRepository.save(rp);
            }
            else {
                // Si no existe, la creamos con isActive = true
                rp = rolePermissionRepository.create({
                    role: { id: roleId },
                    permission: { id: permissionId },
                    isActive: true,
                });
                yield rolePermissionRepository.save(rp);
            }
        }
        res
            .status(200)
            .json({ message: "Permisos asignados (activados) correctamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.assignPermissions = assignPermissions;
// 5) Remover (o desactivar) permisos de un rol:
//    aquí pondremos isActive = false, en lugar de eliminar la fila
const removePermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permissions } = req.body;
        if (!roleId ||
            !Array.isArray(permissions) ||
            permissions.some((p) => typeof p !== "number")) {
            res
                .status(400)
                .json({
                error: "Se requiere roleId y un array de permissions con IDs válidos.",
            });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const rolePermissionRepository = data_source_1.AppDataSource.getRepository(RolePermission_1.RolePermission);
        // Verificar si el rol existe
        const role = yield roleRepository.findOneBy({ id: roleId });
        if (!role) {
            res.status(404).json({ error: "El rol especificado no existe." });
            return;
        }
        // Desactivar la relación en 'role_permissions'
        for (const permissionId of permissions) {
            // Buscar si ya existe la fila en la tabla pivote
            const rp = yield rolePermissionRepository.findOne({
                where: {
                    role: { id: roleId },
                    permission: { id: permissionId },
                },
            });
            // Si existe, se desactiva (isActive = false). 
            // O podrías directamente eliminar la fila con .remove(rp).
            if (rp) {
                rp.isActive = false;
                yield rolePermissionRepository.save(rp);
            }
        }
        res
            .status(200)
            .json({ message: "Permisos desactivados correctamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.removePermissions = removePermissions;
// 6) Obtener permisos de un usuario según su rol. Como 'role.permissions' 
//    ya no existe, cargamos 'role.rolePermissions' y filtramos isActive.
const getUserPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params; // userId es un string aquí
        const userIdNumber = parseInt(userId, 10);
        if (isNaN(userIdNumber)) {
            res.status(400).json({ error: "El ID del usuario debe ser un número." });
            return;
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Cargamos al usuario con su rol, y al rol con las rolePermissions
        // (y dentro de ellas, la permission asociada)
        const user = yield userRepository.findOne({
            where: { id: userIdNumber },
            relations: [
                "role",
                "role.rolePermissions",
                "role.rolePermissions.permission",
            ],
        });
        if (!user || !user.role) {
            res.status(404).json({ error: "Usuario o rol no encontrado." });
            return;
        }
        // Filtrar los que estén isActive = true
        const activePermissions = (_b = (_a = user.role.rolePermissions) === null || _a === void 0 ? void 0 : _a.filter((rp) => rp.isActive).map((rp) => rp.permission)) !== null && _b !== void 0 ? _b : [];
        res.status(200).json({ permissions: activePermissions });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getUserPermissions = getUserPermissions;
// 7) Listar todos los permisos (sin cambios, opcional)
const getAllPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissionRepository = data_source_1.AppDataSource.getRepository(Permission_1.Permission);
        const allPermissions = yield permissionRepository.find({ relations: ["module"], });
        res.status(200).json(allPermissions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener la lista de permisos" });
    }
});
exports.getAllPermissions = getAllPermissions;
