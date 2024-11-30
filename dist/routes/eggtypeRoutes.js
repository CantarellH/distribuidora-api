"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EggTypeController_1 = require("../controllers/EggTypeController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = express_1.default.Router();
router.get("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_egg_types"), EggTypeController_1.getEggTypes);
router.post("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("create_egg_types"), EggTypeController_1.createEggType);
router.put("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("update_egg_types"), EggTypeController_1.updateEggType);
router.delete("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("delete_egg_types"), EggTypeController_1.deleteEggType);
exports.default = router;
