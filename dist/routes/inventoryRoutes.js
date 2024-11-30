"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const InventoryController_1 = require("../controllers/InventoryController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = express_1.default.Router();
router.post("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("create_inventory"), InventoryController_1.createInventoryEntry);
router.get("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_inventory"), InventoryController_1.getInventoryEntries);
router.get("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_inventory"), InventoryController_1.getInventoryEntryById);
router.put("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("update_inventory"), InventoryController_1.updateInventoryEntry);
router.delete("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("delete_inventory"), InventoryController_1.deleteInventoryEntry);
exports.default = router;
