import express from "express";
// import { authenticateToken } from "../middlewares/authenticateToken";
// import { checkPermission } from "../middlewares/checkPermission";

import {
  getAllModules,    // Si creaste un endpoint para listar módulos
  createModule,     // Si creaste un endpoint para crear módulos
  assignModules,
  removeModules,
  getRoleModules,
  getUserModules,
} from "../controllers/ModuleController";

const router = express.Router();

/**
 * Listar todos los módulos
 */
router.get(
  "/list",
  // authenticateToken,
  // checkPermission("view_modules"),
  getAllModules // ← o el nombre de tu controlador que liste módulos
);

/**
 * Crear un nuevo módulo
 */
router.post(
  "/create",
  // authenticateToken,
  // checkPermission("create_modules"),
  createModule // ← si tienes un controlador para crear un módulo
);

/**
 * Asignar módulos a un rol
 */
router.post(
  "/assign",
  // authenticateToken,
  // checkPermission("assign_modules"),
  assignModules
);

/**
 * Remover (desactivar) módulos de un rol
 */
router.post(
  "/remove",
  // authenticateToken,
  // checkPermission("remove_modules"),
  removeModules
);

/**
 * Obtener los módulos activos de un rol
 * (por ejemplo GET /api/modules/role/5)
 */
router.get(
  "/role/:roleId",
  // authenticateToken,
  // checkPermission("view_modules"),
  getRoleModules
);

/**
 * Obtener los módulos activos de un usuario
 * (por ejemplo GET /api/modules/user/10)
 */
router.get(
  "/user/:userId",
  // authenticateToken,
  // checkPermission("view_user_modules"),
  getUserModules
);

export default router;
