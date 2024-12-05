import { Router } from "express";
import {
  createRemission,
  getRemissions,
  getRemissionById,
  updateRemission,
  deleteRemission,
  filterRemissions,
} from "../controllers/RemissionController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = Router();

router.post(
  "/",
  authenticateToken,
  checkPermission("create_remission"),
  createRemission
);

router.get(
  "/search",
  authenticateToken,
  checkPermission("view_remission"),
  filterRemissions
);
router.get(
  "/",
  authenticateToken,
  checkPermission("view_remission"),
  getRemissions
);

router.get(
  "/:id(\\d+)",
  authenticateToken,
  checkPermission("view_remission"),
  getRemissionById
);


router.put(
  "/:id",
  authenticateToken,
  checkPermission("update_remission"),
  updateRemission
);

router.delete(
  "/:id",
  authenticateToken,
  checkPermission("delete_remission"),
  deleteRemission
);

export default router;
