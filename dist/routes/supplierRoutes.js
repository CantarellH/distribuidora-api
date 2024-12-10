"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SupplierController_1 = require("../controllers/SupplierController");
const router = express_1.default.Router();
router.get("/search", 
// authenticateToken,
// checkPermission("view_suppliers"),
SupplierController_1.filterSuppliers);
router.get("/", 
// authenticateToken,
// checkPermission("view_suppliers"),
SupplierController_1.getSuppliers);
router.post("/", 
// authenticateToken,
// checkPermission("create_suppliers"),
SupplierController_1.createSupplier);
router.put("/:id", 
// authenticateToken,
// checkPermission("update_suppliers"),
SupplierController_1.updateSupplier);
router.delete("/:id", 
// authenticateToken,
// checkPermission("delete_suppliers"),
SupplierController_1.deleteSupplier);
exports.default = router;
