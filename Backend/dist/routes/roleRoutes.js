"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const router = express_1.default.Router();
router.get("/list", 
//authenticateToken,
//checkPermission("view_roles"), 
roleController_1.getRoles);
router.post("/create", 
// authenticateToken,
// checkPermission("create_roles"),
roleController_1.createRole);
router.post("/assign", 
// authenticateToken,
// checkPermission("assign_permissions"),
roleController_1.assignPermissions);
router.get("/permissions/all", 
// authenticateToken,
// checkPermission("user_permissions"), 
roleController_1.getAllPermissions);
router.get("/permissions/:userId", 
// authenticateToken,
// checkPermission("user_permissions"),
roleController_1.getUserPermissions);
router.post("/remove", 
// authenticateToken,
// checkPermission("remove_permissions"),
roleController_1.removePermissions);
exports.default = router;
