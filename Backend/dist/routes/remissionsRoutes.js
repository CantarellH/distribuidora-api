"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RemissionController_1 = require("../controllers/RemissionController");
const router = (0, express_1.Router)();
router.post("/", 
// authenticateToken,
// checkPermission("create_remission"),
RemissionController_1.createRemission);
router.post("/detail", 
// authenticateToken,
// checkPermission("create_remission"),
RemissionController_1.createRemissionDetail);
router.get("/search", 
// authenticateToken,
// checkPermission("view_remission"),
RemissionController_1.filterRemissions);
router.get("/", 
// authenticateToken,
// checkPermission("view_remission"),
RemissionController_1.getRemissions);
router.get("/detail", 
// authenticateToken,
// checkPermission("view_remission"),
RemissionController_1.getRemissionDetail);
router.get("/:id(\\d+)", 
// authenticateToken,
// checkPermission("view_remission"),
RemissionController_1.getRemissionById);
router.put("/:id", 
// authenticateToken,
// checkPermission("update_remission"),
RemissionController_1.updateRemission);
router.put("/detail/:id", 
// authenticateToken,
// checkPermission("update_remission"),
RemissionController_1.updateRemissionDetail);
router.delete("/:id", 
// authenticateToken,
// checkPermission("delete_remission"),
RemissionController_1.deleteRemission);
exports.default = router;
