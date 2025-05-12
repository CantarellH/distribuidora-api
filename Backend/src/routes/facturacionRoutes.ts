import { Router } from 'express';
import { FacturacionController } from '../controllers/FacturacionController';

const router = Router();
const controller = new FacturacionController();

router.post('/facturar', controller.generarFactura);

export default router;