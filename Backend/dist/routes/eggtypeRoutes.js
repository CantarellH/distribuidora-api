"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EggTypeController_1 = require("../controllers/EggTypeController");
const router = express_1.default.Router();
router.get("/", 
// authenticateToken,
// checkPermission("view_egg_types"),
EggTypeController_1.getEggTypes);
router.post("/", 
// authenticateToken,
// checkPermission("create_egg_types"),
EggTypeController_1.createEggType);
router.put("/:id", 
// authenticateToken,
// checkPermission("update_egg_types"),
EggTypeController_1.updateEggType);
router.delete("/:id", 
// authenticateToken,
// checkPermission("delete_egg_types"),
EggTypeController_1.deleteEggType);
exports.default = router;
