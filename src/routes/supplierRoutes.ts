import express from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  filterSuppliers,
} from "../controllers/SupplierController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = express.Router();

router.get(
  "/search",
  authenticateToken,
  checkPermission("view_suppliers"),
  filterSuppliers
);
router.get(
  "/",
  authenticateToken,
  checkPermission("view_suppliers"),
  getSuppliers
);
router.post(
  "/",
  authenticateToken,
  checkPermission("create_suppliers"),
  createSupplier
);
router.put(
  "/:id",
  authenticateToken,
  checkPermission("update_suppliers"),
  updateSupplier
);
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete_suppliers"),
  deleteSupplier
);

export default router;
