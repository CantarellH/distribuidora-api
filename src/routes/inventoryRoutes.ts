import express from "express";
import {
  createInventoryEntry,
  getInventoryEntries,
  getInventoryEntryById,
  updateInventoryEntry,
  deleteInventoryEntry,
} from "../controllers/InventoryController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = express.Router();

router.post(
  "/",
  // authenticateToken,
  // checkPermission("create_inventory"),
  createInventoryEntry
);
router.get(
  "/",
  // authenticateToken,
  // checkPermission("view_inventory"),
  getInventoryEntries
);
router.get(
  "/:id",
  // authenticateToken,
  // checkPermission("view_inventory"),
  getInventoryEntryById
);
router.put(
  "/:id",
  // authenticateToken,
  // checkPermission("update_inventory"),
  updateInventoryEntry
);
router.delete(
  "/:id",
  // authenticateToken,
  // checkPermission("delete_inventory"),
  deleteInventoryEntry
);

export default router;
