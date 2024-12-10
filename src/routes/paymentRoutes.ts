import { Router } from "express";
import {
  createPayment,
  getPaymentById,
  getPayments,
  updatePayment,
  deletePayment,
  filterPayments,
} from "../controllers/PaymentsController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { checkPermission } from "../middlewares/checkPermission";

const router = Router();

router.post(
  "/",
  /*authenticateToken,
  checkPermission("create_payment"),*/
  createPayment
);

router.get(
  "/search",
  // authenticateToken,
  // checkPermission("view_remission"),
  filterPayments
);

router.get(
  "/" /*
  authenticateToken,
  checkPermission("view_remission"),*/,
  getPayments
);

router.get(
  "/:id(\\d+)",
  /*authenticateToken,
  checkPermission("view_remission"),*/
  getPaymentById
);

router.put(
  "/:id",
  /*authenticateToken,
  checkPermission("update_remission"),*/
  updatePayment
);

router.delete(
  "/:id",
  /*authenticateToken,
  checkPermission("delete_remission"),*/
  deletePayment
);

export default router;
