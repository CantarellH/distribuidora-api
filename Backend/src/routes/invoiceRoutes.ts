// routes/invoiceRoutes.ts
import { Router } from "express";
import { generateInvoice } from "../controllers/InvoiceController";
// import { authenticateToken } from "../middlewares/authenticateToken";
// import { checkPermission } from "../middlewares/checkPermission";

const router = Router();

// Ruta corregida - usa la función directamente
router.post(
  "/remissions/:remissionId/generate-invoice",
  //authenticate,
  // checkPermission("generate_Invoice"),
  generateInvoice
);

export default router;

