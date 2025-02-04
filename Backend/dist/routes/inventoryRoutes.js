"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const InventoryController_1 = require("../controllers/InventoryController");
const router = express_1.default.Router();
router.post("/", 
// authenticateToken,
// checkPermission("create_inventory"),
InventoryController_1.createInventoryEntry);
router.get("/", 
// authenticateToken,
// checkPermission("view_inventory"),
InventoryController_1.getInventoryEntries);
router.get("/:id", 
// authenticateToken,
// checkPermission("view_inventory"),
InventoryController_1.getInventoryEntryById);
router.put("/:id", 
// authenticateToken,
// checkPermission("update_inventory"),
InventoryController_1.updateInventoryEntry);
router.delete("/:id", 
// authenticateToken,
// checkPermission("delete_inventory"),
InventoryController_1.deleteInventoryEntry);
exports.default = router;
