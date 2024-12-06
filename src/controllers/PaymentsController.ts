import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Payment } from "../models/Payment";
import { Client } from "../models/Client";
import { Remission } from "../models/Remission";

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, amount, method, remissionIds } = req.body;

    if (!clientId || !amount || !method || !Array.isArray(remissionIds)) {
      res.status(400).json({ error: "Todos los campos son obligatorios." });
      return;
    }

    const clientRepository = AppDataSource.getRepository(Client);
    const remissionRepository = AppDataSource.getRepository(Remission);
    const paymentRepository = AppDataSource.getRepository(Payment);

    const client = await clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }

    const remissions = await remissionRepository.findByIds(remissionIds);
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

    await paymentRepository.save(newPayment);

    // Actualizar remisiones con el nuevo pago
    for (const remission of remissions) {
      remission.payment = newPayment;
      await remissionRepository.save(remission);
    }

    res.status(201).json({ message: "Pago creado con éxito.", payment: newPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payments = await paymentRepository.find({
      relations: ["client", "remissions"],
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const paymentRepository = AppDataSource.getRepository(Payment);
    const payment = await paymentRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["client", "remissions"],
    });

    if (!payment) {
      res.status(404).json({ error: "Pago no encontrado." });
      return;
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;

    const paymentRepository = AppDataSource.getRepository(Payment);

    const payment = await paymentRepository.findOne({ where: { id: parseInt(id, 10) } });
    if (!payment) {
      res.status(404).json({ error: "Pago no encontrado." });
      return;
    }

    if (amount) payment.amount = amount;
    if (method) payment.method = method;

    const updatedPayment = await paymentRepository.save(payment);

    res.status(200).json({ message: "Pago actualizado con éxito.", payment: updatedPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const paymentRepository = AppDataSource.getRepository(Payment);
    const remissionRepository = AppDataSource.getRepository(Remission);

    const payment = await paymentRepository.findOne({
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
      await remissionRepository.save(remission);
    }

    await paymentRepository.remove(payment);

    res.status(200).json({ message: "Pago eliminado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
