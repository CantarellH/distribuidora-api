"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SupplierController_1 = require("../controllers/SupplierController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = express_1.default.Router();
router.get("/search", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_suppliers"), SupplierController_1.filterSuppliers);
router.get("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_suppliers"), SupplierController_1.getSuppliers);
router.post("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("create_suppliers"), SupplierController_1.createSupplier);
router.put("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("update_suppliers"), SupplierController_1.updateSupplier);
router.delete("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("delete_suppliers"), SupplierController_1.deleteSupplier);
exports.default = router;
