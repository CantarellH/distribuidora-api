"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = express_1.default.Router();
router.post("/login", userController_1.loginUser);
router.get("/list", /*authenticateToken, checkPermission("view_users"),*/ userController_1.getUsers);
router.put("/update/:id", 
// authenticateToken,
// checkPermission("update_user"),
userController_1.updateUser);
router.post("/create", 
// authenticateToken,
// checkPermission("create_user"),
userController_1.createUser);
// ✅ Asegurar que authenticateToken se use antes de `me`
router.get("/me", authenticateToken_1.authenticateToken, 
// checkPermission("check_user"),
userController_1.me);
router.delete("/:id", 
// authenticateToken,
// checkPermission("delete_user"),
userController_1.deleteUser);
exports.default = router;
