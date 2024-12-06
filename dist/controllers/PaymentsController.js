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
exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.getPayments = exports.createPayment = void 0;
const data_source_1 = require("../config/data-source");
const Payment_1 = require("../models/Payment");
const Client_1 = require("../models/Client");
const Remission_1 = require("../models/Remission");
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, amount, method, remissionIds } = req.body;
        if (!clientId || !amount || !method || !Array.isArray(remissionIds)) {
            res.status(400).json({ error: "Todos los campos son obligatorios." });
            return;
        }
        const clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        const remissionRepository = data_source_1.AppDataSource.getRepository(Remission_1.Remission);
        const paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        const client = yield clientRepository.findOne({ where: { id: clientId } });
        if (!client) {
            res.status(404).json({ error: "Cliente no encontrado." });
            return;
        }
        const remissions = yield remissionRepository.findByIds(remissionIds);
        if (remissions.length !== remissionIds.length) {
            res
                .status(404)
                .json({ error: "Una o más remisiones no fueron encontradas." });
            return;
        }
        const newPayment = paymentRepository.create({
            client,
            amount,
            method,
            remissions,
        });
        yield paymentRepository.save(newPayment);
        // Actualizar remisiones con el nuevo pago
        for (const remission of remissions) {
            remission.payment = newPayment;
            yield remissionRepository.save(remission);
        }
        res.status(201).json({ message: "Pago creado con éxito.", payment: newPayment });
    }
    catch (error) {
        console.error(error);
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
        const payment = yield paymentRepository.findOne({ where: { id: parseInt(id, 10) } });
        if (!payment) {
            res.status(404).json({ error: "Pago no encontrado." });
            return;
        }
        if (amount)
            payment.amount = amount;
        if (method)
            payment.method = method;
        const updatedPayment = yield paymentRepository.save(payment);
        res.status(200).json({ message: "Pago actualizado con éxito.", payment: updatedPayment });
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
            remission.payment = null;
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
