import { Router } from "express";
import {
  createRemission,
  createRemissionDetail,
  getRemissions,
  getRemissionDetail,
  getRemissionById,
  updateRemission,
  updateRemissionDetail,
  deleteRemission,
  filterRemissions,
} from "../controllers/RemissionController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = Router();

router.post(
  "/",
  // authenticateToken,
  // checkPermission("create_remission"),
  createRemission
);
router.post(
  "/detail",
  // authenticateToken,
  // checkPermission("create_remission"),
  createRemissionDetail
);
router.get(
  "/search",
  // authenticateToken,
  // checkPermission("view_remission"),
  filterRemissions
);
router.get(
  "/",
  // authenticateToken,
  // checkPermission("view_remission"),
  getRemissions
);
router.get(
  "/detail",
  // authenticateToken,
  // checkPermission("view_remission"),
  getRemissionDetail
);

router.get(
  "/:id(\\d+)",
  // authenticateToken,
  // checkPermission("view_remission"),
  getRemissionById
);


router.put(
  "/:id",
  // authenticateToken,
  // checkPermission("update_remission"),
  updateRemission
);

router.put(
  "/detail/:id",
  // authenticateToken,
  // checkPermission("update_remission"),
  updateRemissionDetail
);

router.delete(
  "/:id",
  // authenticateToken,
  // checkPermission("delete_remission"),
  deleteRemission
);

export default router;
