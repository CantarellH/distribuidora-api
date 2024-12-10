import express from "express";
import {
  getEggTypes,
  createEggType,
  updateEggType,
  deleteEggType,
} from "../controllers/EggTypeController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = express.Router();

router.get(
  "/",
  // authenticateToken,
  // checkPermission("view_egg_types"),
  getEggTypes
);
router.post(
  "/",
  // authenticateToken,
  // checkPermission("create_egg_types"),
  createEggType
);
router.put(
  "/:id",
  // authenticateToken,
  // checkPermission("update_egg_types"),
  updateEggType
);
router.delete(
  "/:id",
  // authenticateToken,
  // checkPermission("delete_egg_types"),
  deleteEggType
);

export default router;
