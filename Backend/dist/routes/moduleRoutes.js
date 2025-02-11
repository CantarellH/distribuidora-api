"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { authenticateToken } from "../middlewares/authenticateToken";
// import { checkPermission } from "../middlewares/checkPermission";
const ModuleController_1 = require("../controllers/ModuleController");
const router = express_1.default.Router();
/**
 * Listar todos los módulos
 */
router.get("/list", 
// authenticateToken,
// checkPermission("view_modules"),
ModuleController_1.getAllModules // ← o el nombre de tu controlador que liste módulos
);
/**
 * Crear un nuevo módulo
 */
router.post("/create", 
// authenticateToken,
// checkPermission("create_modules"),
ModuleController_1.createModule // ← si tienes un controlador para crear un módulo
);
/**
 * Asignar módulos a un rol
 */
router.post("/assign", 
// authenticateToken,
// checkPermission("assign_modules"),
ModuleController_1.assignModules);
/**
 * Remover (desactivar) módulos de un rol
 */
router.post("/remove", 
// authenticateToken,
// checkPermission("remove_modules"),
ModuleController_1.removeModules);
/**
 * Obtener los módulos activos de un rol
 * (por ejemplo GET /api/modules/role/5)
 */
router.get("/role/:roleId", 
// authenticateToken,
// checkPermission("view_modules"),
ModuleController_1.getRoleModules);
/**
 * Obtener los módulos activos de un usuario
 * (por ejemplo GET /api/modules/user/10)
 */
router.get("/user/:userId", 
// authenticateToken,
// checkPermission("view_user_modules"),
ModuleController_1.getUserModules);
exports.default = router;
