"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentsController_1 = require("../controllers/PaymentsController");
const router = (0, express_1.Router)();
router.post("/", 
/*authenticateToken,
checkPermission("create_payment"),*/
PaymentsController_1.createPayment);
router.get("/search", 
// authenticateToken,
// checkPermission("view_remission"),
PaymentsController_1.filterPayments);
router.get("/" /*
authenticateToken,
checkPermission("view_remission"),*/, PaymentsController_1.getPayments);
router.get("/:id(\\d+)", 
/*authenticateToken,
checkPermission("view_remission"),*/
PaymentsController_1.getPaymentById);
router.put("/:id", 
/*authenticateToken,
checkPermission("update_remission"),*/
PaymentsController_1.updatePayment);
router.delete("/:id", 
/*authenticateToken,
checkPermission("delete_remission"),*/
PaymentsController_1.deletePayment);
exports.default = router;
