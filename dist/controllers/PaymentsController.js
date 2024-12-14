"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterPayments = exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.getPayments = exports.createPayment = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Payment_1 = require("../models/Payment");
const Client_1 = require("../models/Client");
const Remission_1 = require("../models/Remission");
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, remissionIds, amount, method } = req.body;
        // Validar datos requeridos
        if (!clientId || !remissionIds || !amount || !method) {
            res.status(400).json({ error: "Faltan campos obligatorios." });
            return;
        }
        const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        // Verificar si el cliente existe
        const client = yield clientRepository.findOne({ where: { id: clientId } });
        if (!client) {
            res.status(404).json({ error: "Cliente no encontrado." });
            return;
        }
        // Verificar si las remisiones existen
        const remissions = yield remissionRepository.findBy({ id: (0, typeorm_1.In)(remissionIds) });
        if (remissions.length !== remissionIds.length) {
            res.status(400).json({ error: "Algunas remisiones no existen." });
            return;
        }
        // Crear el pago (sin asignar remisiones aún)
        const newPayment = paymentRepository.create({
            client,
            amount,
            method,
        });
        yield paymentRepository.save(newPayment);
        // Asociar el pago con las remisiones
        for (const remission of remissions) {
            // Agregar el nuevo pago a la lista de pagos de la remisión
            remission.payments = [...(remission.payments || []), newPayment];
            // Guardar la remisión actualizada con el nuevo pago
            yield remissionRepository.save(remission);
            // Calcular el total pagado, manejando casos en los que remission.payments esté vacío o indefinido
            const totalPaid = remission.payments
                ? remission.payments.reduce((sum, payment) => sum + payment.amount, 0)
                : 0;
            // Calcular el total de la remisión basado en los detalles
            const totalAmount = remission.details.reduce((sum, detail) => sum + detail.weightTotal * detail.boxCount, 0);
            // Marcar la remisión como pagada si el total pagado cubre o excede el monto total
            if (totalPaid >= totalAmount) {
                remission.isPaid = true;
                yield remissionRepository.save(remission); // Guardar el cambio en el estado de la remisión
            }
        }
        res.status(201).json({
            message: "Pago registrado y remisiones actualizadas.",
            payment: newPayment,
        });
    }
    catch (error) {
        console.error("Error al registrar el pago:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.createPayment = createPayment;
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const payments = yield paymentRepository.find({
            relations: ["client", "remissions"],
        });
        res.status(200).json(payments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getPayments = getPayments;
const getPaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const payment = yield paymentRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["client", "remissions"],
        });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        res.status(200).json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.getPaymentById = getPaymentById;
const updatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, method } = req.body;
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const payment = yield paymentRepository.findOne({
            where: { id: parseInt(id, 10) },
        });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        if (amount)
            payment.amount = amount;
        if (method)
            payment.method = method;
        const updatedPayment = yield paymentRepository.save(payment);
        res
            .status(200)
            .json({
            message: "Pago actualizado con éxito.",
            payment: updatedPayment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.updatePayment = updatePayment;
const deletePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const payment = yield paymentRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["remissions"],
        });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        // Eliminar referencia del pago en las remisiones
        for (const remission of payment.remissions) {
            remission.payments = [];
            yield remissionRepository.save(remission);
        }
        yield paymentRepository.remove(payment);
        res.status(200).json({ message: "Pago eliminado con éxito." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.deletePayment = deletePayment;
const filterPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, startDate, endDate, method, minAmount, maxAmount } = req.query;
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const query = paymentRepository.createQueryBuilder("payment");
        query
            .leftJoinAndSelect("payment.client", "client")
            .leftJoinAndSelect("payment.remissions", "remissions");
        // Filtro por cliente
        if (clientId) {
            query.andWhere("payment.client = :clientId", {
                clientId: parseInt(clientId, 10),
            });
        }
        // Filtro por rango de fechas
        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);
            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                res.status(400).json({ error: "Fechas inválidas" });
                return;
            }
            query.andWhere("payment.createdAt BETWEEN :startDate AND :endDate", {
                startDate: parsedStartDate.toISOString(),
                endDate: parsedEndDate.toISOString(),
            });
        }
        // Filtro por método de pago
        if (method) {
            query.andWhere("payment.method = :method", { method });
        }
        // Filtro por rango de montos
        if (minAmount || maxAmount) {
            if (minAmount) {
                query.andWhere("payment.amount >= :minAmount", {
                    minAmount: parseFloat(minAmount),
                });
            }
            if (maxAmount) {
                query.andWhere("payment.amount <= :maxAmount", {
                    maxAmount: parseFloat(maxAmount),
                });
            }
        }
        // Obtener los pagos filtrados
        const payments = yield query.getMany();
        res.status(200).json(payments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.filterPayments = filterPayments;
