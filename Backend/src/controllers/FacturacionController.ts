import { Request, Response } from 'express';
import { FacturacionService } from '../services/FacturacionService';
import { FacturacionError } from '../errors/FacturacionError';

export class FacturacionController {
    private service = new FacturacionService();

    async generarFactura(req: Request, res: Response) {
        try {
            const { remissionId } = req.body;
            
            if (!remissionId) {
                throw new FacturacionError('El ID de remisión es requerido', 400);
            }

            const resultado = await this.service.generarFactura(Number(remissionId));
            res.status(201).json(resultado);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: unknown, res: Response) {
        if (error instanceof FacturacionError) {
            res.status(error.statusCode).json(error.toJSON());
        } else {
            console.error('Error inesperado:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Ocurrió un error inesperado'
            });
        }
    }
}