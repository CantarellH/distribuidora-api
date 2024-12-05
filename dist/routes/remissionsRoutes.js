"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RemissionController_1 = require("../controllers/RemissionController");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.post("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("create_remission"), RemissionController_1.createRemission);
router.get("/", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_remission"), RemissionController_1.getRemissions);
router.get("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_remission"), RemissionController_1.getRemissionById);
router.get("/search", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("view_remission"), RemissionController_1.filterRemissions);
router.put("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("update_remission"), RemissionController_1.updateRemission);
router.delete("/:id", authenticateToken_1.authenticateToken, (0, checkPermission_1.checkPermission)("delete_remission"), RemissionController_1.deleteRemission);
exports.default = router;
