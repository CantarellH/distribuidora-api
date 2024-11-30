// src/routes/userRoutes.ts
import express from "express";
import {
  createUser,
  validateCreateUser,
  handleValidationErrors,
  loginUser,
} from "../controllers/userController";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = express.Router();

router.post("/login", loginUser);
router.get("/list", authenticateToken, checkPermission("view_users"), getUsers);
router.put(
  "/update/:id",
  authenticateToken,
  checkPermission("update_user"),
  updateUser
);
router.post(
  "/create",
  authenticateToken,
  checkPermission("create_user"),
  createUser
);
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete_user"),
  deleteUser
);
export default router;
