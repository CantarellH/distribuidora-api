// src/routes/userRoutes.ts
import express from "express";
import {
  createUser,
  validateCreateUser,
  getUsers,
  updateUser,
  deleteUser,
  handleValidationErrors,
  loginUser,
  me
} from "../controllers/userController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = express.Router();

router.post("/login", loginUser);

router.get("/list", /*authenticateToken, checkPermission("view_users"),*/ getUsers);

router.put(
  "/update/:id",
 // authenticateToken,
 // checkPermission("update_user"),
  updateUser
);
router.post(
  "/create",
 // authenticateToken,
 // checkPermission("create_user"),
  createUser
);



// ✅ Asegurar que authenticateToken se use antes de `me`
router.get(
  "/me",
   authenticateToken,
    // checkPermission("check_user"),
    me);
  

router.delete(
  "/:id",
 // authenticateToken,
 // checkPermission("delete_user"),
  deleteUser
);
export default router;
