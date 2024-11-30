import express from "express";
import { Request, Response, NextFunction } from "express";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";
import {
  getUserPermissions,
  assignPermissions,
  removePermissions,
  handleValidationErrors,
  getRoles,
  createRole,
} from "../controllers/roleController";

const router = express.Router();

router.get("/list", authenticateToken, checkPermission("view_roles"), getRoles);
router.post(
  "/create",
  authenticateToken,
  checkPermission("create_roles"),
  createRole
);
router.post(
  "/assign",
  authenticateToken,
  checkPermission("assign_permissions"),
  assignPermissions
);
router.get(
  "/permissions/:userId",
  authenticateToken,
  checkPermission("user_permissions"),
  getUserPermissions
);
router.post(
  "/remove",
  authenticateToken,
  checkPermission("remove_permissions"),
  removePermissions
);
export default router;
