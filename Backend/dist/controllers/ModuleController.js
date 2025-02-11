"use strict";
// controllers/moduleController.ts
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
exports.getUserModules = exports.getRoleModules = exports.removeModules = exports.assignModules = exports.createModule = exports.getAllModules = void 0;
const data_source_1 = require("../config/data-source");
const RoleModule_1 = require("../models/RoleModule");
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
// Ajusta si tu archivo se llama realmente Module.ts o Modules.ts
const Modules_1 = require("../models/Modules");
const getAllModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moduleRepo = data_source_1.AppDataSource.getRepository(Modules_1.Module);
        const modules = yield moduleRepo.find({ relations: ["roleModules", "permissions"] });
        res.status(200).json(modules);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener módulos" });
    }
});
exports.getAllModules = getAllModules;
const createModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "El módulo necesita un nombre" });
            return;
        }
        const moduleRepo = data_source_1.AppDataSource.getRepository(Modules_1.Module);
        const newModule = moduleRepo.create({ name });
        yield moduleRepo.save(newModule);
        res.status(201).json(newModule);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el módulo" });
    }
});
exports.createModule = createModule;
const assignModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, modules } = req.body;
        if (!roleId || !Array.isArray(modules)) {
            res.status(400).json({
                error: "Se requiere roleId y un array de módulos."
            });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const roleModuleRepository = data_source_1.AppDataSource.getRepository(RoleModule_1.RoleModule);
        // Verificar rol
        const role = yield roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            res.status(404).json({ error: "El rol especificado no existe." });
            return;
        }
        // Activar o crear la relación en 'role_modules'
        for (const moduleId of modules) {
            let rm = yield roleModuleRepository.findOne({
                where: {
                    role: { id: roleId },
                    module: { id: moduleId },
                },
            });
            if (rm) {
                // Ya existe, solo activamos
                rm.isActive = true;
                yield roleModuleRepository.save(rm);
            }
            else {
                // No existe, lo creamos
                rm = roleModuleRepository.create({
                    role: { id: roleId },
                    module: { id: moduleId },
                    isActive: true,
                });
                yield roleModuleRepository.save(rm);
            }
        }
        res.status(200).json({
            message: "Módulos asignados (activados) correctamente."
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.assignModules = assignModules;
const removeModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, modules } = req.body;
        if (!roleId || !Array.isArray(modules)) {
            res.status(400).json({
                error: "Se requiere roleId y un array de módulos."
            });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const roleModuleRepository = data_source_1.AppDataSource.getRepository(RoleModule_1.RoleModule);
        // Verificar rol
        const role = yield roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            res.status(404).json({ error: "El rol especificado no existe." });
            return;
        }
        // Desactivar la relación en 'role_modules'
        for (const moduleId of modules) {
            const rm = yield roleModuleRepository.findOne({
                where: {
                    role: { id: roleId },
                    module: { id: moduleId },
                },
            });
            if (rm) {
                rm.isActive = false;
                // O podrías hacer: await roleModuleRepository.remove(rm);
                yield roleModuleRepository.save(rm);
            }
        }
        res.status(200).json({
            message: "Módulos desactivados correctamente."
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.removeModules = removeModules;
const getRoleModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { roleId } = req.params;
        const roleIdNumber = parseInt(roleId, 10);
        if (isNaN(roleIdNumber)) {
            res.status(400).json({ error: "El ID del rol debe ser un número." });
            return;
        }
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const role = yield roleRepository.findOne({
            where: { id: roleIdNumber },
            relations: ["roleModules", "roleModules.module"],
        });
        if (!role) {
            res.status(404).json({ error: "Rol no encontrado." });
            return;
        }
        // Filtrar los módulos activos
        const activeModules = (_b = (_a = role.roleModules) === null || _a === void 0 ? void 0 : _a.filter((rm) => rm.isActive).map((rm) => rm.module)) !== null && _b !== void 0 ? _b : [];
        res.status(200).json({
            roleId: role.id,
            name: role.name,
            modules: activeModules,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getRoleModules = getRoleModules;
const getUserModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params;
        const userIdNumber = parseInt(userId, 10);
        if (isNaN(userIdNumber)) {
            res.status(400).json({ error: "El ID del usuario debe ser un número." });
            return;
        }
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({
            where: { id: userIdNumber },
            relations: [
                "role",
                "role.roleModules",
                "role.roleModules.module",
            ],
        });
        if (!user || !user.role) {
            res.status(404).json({ error: "Usuario o rol no encontrado." });
            return;
        }
        // Filtrar los módulos activos
        const activeModules = (_b = (_a = user.role.roleModules) === null || _a === void 0 ? void 0 : _a.filter((rm) => rm.isActive).map((rm) => rm.module)) !== null && _b !== void 0 ? _b : [];
        res.status(200).json({ modules: activeModules });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getUserModules = getUserModules;
