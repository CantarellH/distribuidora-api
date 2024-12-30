import { In } from "typeorm";
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Payment } from "../models/Payment";
import { Client } from "../models/Client";
import { PaymentDetail } from "../models/PaymentDetail";
import { Remission } from "../models/Remission";
import { RemissionDetail } from "../models/RemissionDetail";

export const createPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clientId, paymentDetails, method } = req.body;

    if (
      !clientId ||
      !paymentDetails ||
      !method ||
      paymentDetails.length === 0
    ) {
      res.status(400).json({
        error: "Faltan campos obligatorios o detalles de pago están vacíos.",
      });
      return;
    }

    const client = await AppDataSource.getRepository(Client).findOneBy({
      id: clientId,
    });
    if (!client) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }

    const paymentRepository = AppDataSource.getRepository(Payment);
    const paymentDetailRepository = AppDataSource.getRepository(PaymentDetail);
    const remissionRepository = AppDataSource.getRepository(Remission);

    const newPayment = paymentRepository.create({
      client,
      amount: paymentDetails.reduce(
        (sum: number, detail: { amountAssigned: number }) =>
          sum + detail.amountAssigned,
        0
      ),
      method,
    });

    const savedPayment = await paymentRepository.save(newPayment);

    for (const detail of paymentDetails) {
      const remission = await remissionRepository.findOne({
        where: { id: detail.remissionId },
        relations: ["paymentDetails"],
      });

      if (!remission) {
        continue;
      }

      const totalPaidPreviously = remission.paymentDetails.reduce(
        (sum: number, pd: PaymentDetail) => sum + pd.amountAssigned,
        0
      );
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

      await paymentDetailRepository.save(paymentDetail);

      remission.isPaid = newTotalPaid >= remission.totalCost;
      await remissionRepository.save(remission);
    }

    res
      .status(201)
      .json({ message: "Pago registrado con éxito.", payment: savedPayment });
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
    const payments = await AppDataSource.getRepository(Payment).find({
      relations: ["client", "paymentDetails", "paymentDetails.remission"],
    });
    res.json(payments);
  } catch (error) {
    console.error("Error al obtener los pagos:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params;

      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = await paymentRepository.findOne({
          where: { id: parseInt(id, 10) },
          relations: ["client", "paymentDetails", "paymentDetails.remission"]
      });

      if (!payment) {
          res.status(404).json({ error: "Pago no encontrado." });
          return;
      }

      res.status(200).json(payment);
  } catch (error) {
      console.error("Error al obtener el pago por ID:", error);
      res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params;
      const { amount, method } = req.body;

      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = await paymentRepository.findOne({
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

      if (method) payment.method = method;

      const updatedPayment = await paymentRepository.save(payment);

      res.status(200).json({
          message: "Pago actualizado con éxito.",
          payment: updatedPayment
      });
  } catch (error) {
      console.error("Error al actualizar el pago:", error);
      res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params;

      const paymentRepository = AppDataSource.getRepository(Payment);
      const paymentDetailRepository = AppDataSource.getRepository(PaymentDetail);

      const payment = await paymentRepository.findOne({
          where: { id: parseInt(id, 10) },
          relations: ["paymentDetails", "paymentDetails.remission"]
      });

      if (!payment) {
          res.status(404).json({ error: "Pago no encontrado." });
          return;
      }

      for (const detail of payment.paymentDetails) {
          const remission = detail.remission;
          await paymentDetailRepository.remove(detail);

          // Recalcular el total pagado de la remisión
          const totalPaid = remission.paymentDetails.reduce((sum, pd) => sum + pd.amountAssigned, 0);
          remission.isPaid = totalPaid >= remission.totalCost;
          await AppDataSource.getRepository(Remission).save(remission);
      }

      await paymentRepository.remove(payment);

      res.status(200).json({ message: "Pago eliminado con éxito." });
  } catch (error) {
      console.error("Error al eliminar el pago:", error);
      res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const filterPayments = async (req: Request, res: Response): Promise<void> => {
  try {
      const { clientId, startDate, endDate, method, minAmount, maxAmount } = req.query;

      const paymentRepository = AppDataSource.getRepository(Payment);
      const query = paymentRepository.createQueryBuilder("payment")
          .leftJoinAndSelect("payment.client", "client")
          .leftJoinAndSelect("payment.paymentDetails", "paymentDetails")
          .leftJoinAndSelect("paymentDetails.remission", "remission");

      if (clientId) {
          query.andWhere("client.id = :clientId", { clientId: parseInt(clientId as string, 10) });
      }

      if (startDate && endDate) {
          const parsedStartDate = new Date(startDate as string);
          const parsedEndDate = new Date(endDate as string);

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
                  minAmount: parseFloat(minAmount as string)
              });
          }
          if (maxAmount) {
              query.andWhere("payment.amount <= :maxAmount", {
                  maxAmount: parseFloat(maxAmount as string)
              });
          }
      }

      const payments = await query.getMany();
      res.status(200).json(payments);
  } catch (error) {
      console.error("Error al filtrar los pagos:", error);
      res.status(500).json({ error: "Error interno del servidor." });
  }
};

