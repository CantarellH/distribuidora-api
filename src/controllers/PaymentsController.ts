import {In,} from "typeorm";
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Payment } from "../models/Payment";
import { Client } from "../models/Client";
import { Remission } from "../models/Remission";


export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, remissionIds, amount, method } = req.body;

    // Validar datos requeridos
    if (!clientId || !remissionIds || !amount || !method) {
      res.status(400).json({ error: "Faltan campos obligatorios." });
      return;
    }

    const clientRepository = AppDataSource.getRepository(Client);
    const remissionRepository = AppDataSource.getRepository(Remission);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Verificar si el cliente existe
    const client = await clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }

    // Verificar si las remisiones existen
    const remissions = await remissionRepository.find({
      where: { id: In(remissionIds) },
      relations: ["payments", "details"],
    });

    if (remissions.length !== remissionIds.length) {
      res.status(400).json({ error: "Algunas remisiones no existen." });
      return;
    }

    // Crear el pago
    const newPayment = paymentRepository.create({
      client,
      amount,
      method,
    });
    await paymentRepository.save(newPayment);

    // Asociar el pago con las remisiones y actualizar su estado
    for (const remission of remissions) {
      // Asegurarse de que remission.payments esté inicializado
      remission.payments = remission.payments || [];

      // Agregar el nuevo pago a la lista
      remission.payments.push(newPayment);

      // Calcular el total pagado
      const totalPaid = remission.payments.reduce((sum, payment) => sum + payment.amount, 0);

      // Calcular el monto total de la remisión
      const totalAmount = remission.details.reduce(
        (sum, detail) => sum + detail.weightTotal * detail.boxCount,
        0
      );

      // Marcar la remisión como pagada si corresponde
      if (totalPaid >= totalAmount) {
        remission.isPaid = true;
      }

      await remissionRepository.save(remission);
    }

    res.status(201).json({
      message: "Pago registrado y remisiones actualizadas.",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


export const getPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const getPaymentById = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const updatePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;

    const paymentRepository = AppDataSource.getRepository(Payment);

    const payment = await paymentRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!payment) {
      res.status(404).json({ error: "Pago no encontrado." });
      return;
    }

    if (amount) payment.amount = amount;
    if (method) payment.method = method;

    const updatedPayment = await paymentRepository.save(payment);

    res
      .status(200)
      .json({
        message: "Pago actualizado con éxito.",
        payment: updatedPayment,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deletePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      remission.payments = [];
      await remissionRepository.save(remission);
    }

    await paymentRepository.remove(payment);

    res.status(200).json({ message: "Pago eliminado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
export const filterPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clientId, startDate, endDate, method, minAmount, maxAmount } =
      req.query;

    const paymentRepository = AppDataSource.getRepository(Payment);
    const query = paymentRepository.createQueryBuilder("payment");

    query
      .leftJoinAndSelect("payment.client", "client")
      .leftJoinAndSelect("payment.remissions", "remissions");

    // Filtro por cliente
    if (clientId) {
      query.andWhere("payment.client = :clientId", {
        clientId: parseInt(clientId as string, 10),
      });
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

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
          minAmount: parseFloat(minAmount as string),
        });
      }
      if (maxAmount) {
        query.andWhere("payment.amount <= :maxAmount", {
          maxAmount: parseFloat(maxAmount as string),
        });
      }
    }

    // Obtener los pagos filtrados
    const payments = await query.getMany();
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
