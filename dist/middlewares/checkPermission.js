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
exports.checkPermission = void 0;
const data_source_1 = require("../config/data-source");
const Role_1 = require("../models/Role");
const checkPermission = (permission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            if (!userRole) {
                console.log("Usuario no tiene rol asignado. req.user:", req.user);
                res.status(403).json({ error: "No tienes un rol asignado" });
                return;
            }
            // Busca el rol con sus permisos
            const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
            const role = yield roleRepository.findOne({
                where: { name: userRole },
                relations: ["permissions"],
            });
            if (!role) {
                console.log("Rol no encontrado en la base de datos. userRole:", userRole);
                res.status(403).json({ error: "Rol no válido" });
                return;
            }
            if (!role.permissions || role.permissions.length === 0) {
                console.log("El rol no tiene permisos asignados. role:", role);
                res
                    .status(403)
                    .json({ error: "No tienes permisos asignados para este rol" });
                return;
            }
            // Validar si el permiso requerido está en los permisos del rol
            const hasPermission = role.permissions.some((perm) => {
                return perm.name === permission;
            });
            if (!hasPermission) {
                console.log("Permiso requerido no encontrado en el rol.");
                console.log("Permisos del rol:", role.permissions);
                res
                    .status(403)
                    .json({ error: "No tienes permiso para realizar esta acción" });
                return;
            }
            console.log("Permiso encontrado. Continuando...");
            next(); // Continúa con el siguiente middleware si todo está bien
        }
        catch (error) {
            console.error("Error en checkPermission:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    });
};
exports.checkPermission = checkPermission;
