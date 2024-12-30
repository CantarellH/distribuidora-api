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
const data_source_1 = require("../config/data-source");
const Payment_1 = require("../models/Payment");
const Client_1 = require("../models/Client");
const PaymentDetail_1 = require("../models/PaymentDetail");
const Remission_1 = require("../models/Remission");
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, paymentDetails, method } = req.body;
        if (!clientId ||
            !paymentDetails ||
            !method ||
            paymentDetails.length === 0) {
            res.status(400).json({
                error: "Faltan campos obligatorios o detalles de pago están vacíos.",
            });
            return;
        }
        const client = yield data_source_1.AppDataSource.getRepository(Client_1.Client).findOneBy({
            id: clientId,
        });
        if (!client) {
            res.status(404).json({ error: "Cliente no encontrado." });
            return;
        }
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const paymentDetailRepository = data_source_1.AppDataSource.getRepository(PaymentDetail_1.PaymentDetail);
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const newPayment = paymentRepository.create({
            client,
            amount: paymentDetails.reduce((sum, detail) => sum + detail.amountAssigned, 0),
            method,
        });
        const savedPayment = yield paymentRepository.save(newPayment);
        for (const detail of paymentDetails) {
            const remission = yield remissionRepository.findOne({
                where: { id: detail.remissionId },
                relations: ["paymentDetails"],
            });
            if (!remission) {
                continue;
            }
            const totalPaidPreviously = remission.paymentDetails.reduce((sum, pd) => sum + pd.amountAssigned, 0);
            const newTotalPaid = totalPaidPreviously + detail.amountAssigned;
            if (newTotalPaid > remission.totalCost) {
                res.status(400).json({
                    error: `El pago excede el monto total de la remisión ${detail.remissionId}.`,
                });
                return;
            }
            const paymentDetail = paymentDetailRepository.create({
                payment: savedPayment,
                remission,
                amountAssigned: detail.amountAssigned,
            });
            yield paymentDetailRepository.save(paymentDetail);
            remission.isPaid = newTotalPaid >= remission.totalCost;
            yield remissionRepository.save(remission);
        }
        res
            .status(201)
            .json({ message: "Pago registrado con éxito.", payment: savedPayment });
    }
    catch (error) {
        console.error("Error al registrar el pago:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.createPayment = createPayment;
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield data_source_1.AppDataSource.getRepository(Payment_1.Payment).find({
            relations: ["client", "paymentDetails", "paymentDetails.remission"],
        });
        res.json(payments);
    }
    catch (error) {
        console.error("Error al obtener los pagos:", error);
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
            relations: ["client", "paymentDetails", "paymentDetails.remission"]
        });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        res.status(200).json(payment);
    }
    catch (error) {
        console.error("Error al obtener el pago por ID:", error);
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
            relations: ["paymentDetails"]
        });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        if (amount) {
            const totalAssigned = payment.paymentDetails.reduce((sum, pd) => sum + pd.amountAssigned, 0);
            if (amount < totalAssigned) {
                res.status(400).json({
                    error: "El monto total no puede ser menor a la suma asignada a las remisiones."
                });
                return;
            }
            payment.amount = amount;
        }
        if (method)
            payment.method = method;
        const updatedPayment = yield paymentRepository.save(payment);
        res.status(200).json({
            message: "Pago actualizado con éxito.",
            payment: updatedPayment
        });
    }
    catch (error) {
        console.error("Error al actualizar el pago:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.updatePayment = updatePayment;
const deletePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const paymentDetailRepository = data_source_1.AppDataSource.getRepository(PaymentDetail_1.PaymentDetail);
        const payment = yield paymentRepository.findOne({
            where: { id: parseInt(id, 10) },
            relations: ["paymentDetails", "paymentDetails.remission"]
        });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        for (const detail of payment.paymentDetails) {
            const remission = detail.remission;
            yield paymentDetailRepository.remove(detail);
            // Recalcular el total pagado de la remisión
            const totalPaid = remission.paymentDetails.reduce((sum, pd) => sum + pd.amountAssigned, 0);
            remission.isPaid = totalPaid >= remission.totalCost;
            yield data_source_1.AppDataSource.getRepository(Remission_1.Remission).save(remission);
        }
        yield paymentRepository.remove(payment);
        res.status(200).json({ message: "Pago eliminado con éxito." });
    }
    catch (error) {
        console.error("Error al eliminar el pago:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.deletePayment = deletePayment;
const filterPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, startDate, endDate, method, minAmount, maxAmount } = req.query;
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const query = paymentRepository.createQueryBuilder("payment")
            .leftJoinAndSelect("payment.client", "client")
            .leftJoinAndSelect("payment.paymentDetails", "paymentDetails")
            .leftJoinAndSelect("paymentDetails.remission", "remission");
        if (clientId) {
            query.andWhere("client.id = :clientId", { clientId: parseInt(clientId, 10) });
        }
        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);
            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                res.status(400).json({ error: "Fechas inválidas." });
                return;
            }
            query.andWhere("payment.createdAt BETWEEN :startDate AND :endDate", {
                startDate: parsedStartDate.toISOString(),
                endDate: parsedEndDate.toISOString()
            });
        }
        if (method) {
            query.andWhere("payment.method = :method", { method });
        }
        if (minAmount || maxAmount) {
            if (minAmount) {
                query.andWhere("payment.amount >= :minAmount", {
                    minAmount: parseFloat(minAmount)
                });
            }
            if (maxAmount) {
                query.andWhere("payment.amount <= :maxAmount", {
                    maxAmount: parseFloat(maxAmount)
                });
            }
        }
        const payments = yield query.getMany();
        res.status(200).json(payments);
    }
    catch (error) {
        console.error("Error al filtrar los pagos:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
exports.filterPayments = filterPayments;
