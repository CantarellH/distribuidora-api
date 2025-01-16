import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Remission } from "../models/Remission";
import { RemissionDetail } from "../models/RemissionDetail";
import { BoxWeight } from "../models/BoxWeight";
import { EggType } from "../models/EggType";
import { Client } from "../models/Client";
import { PaymentDetail } from "../models/PaymentDetail";
import { Supplier } from "../models/Supplier";

export const createRemission = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { date, clientId, details } = req.body;

    if (!date || !clientId) {
      res.status(400).json({
        error: "Los campos 'date' y 'clientId' son obligatorios.",
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

    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = remissionRepository.create({ date, client });
    const savedRemission = await remissionRepository.save(remission);

    let totalWeight = 0; // Peso total acumulado de la remisión
    let totalCost = 0; // Costo total acumulado de la remisión

    if (details && Array.isArray(details)) {
      const remissionDetailRepository =
        AppDataSource.getRepository(RemissionDetail);

      for (const detail of details) {
        const {
          eggTypeId,
          supplierId,
          boxCount,
          weights,
          weightTotal,
          pricePerKilo,
        } = detail;

        if (!eggTypeId || !supplierId || !boxCount || !pricePerKilo) {
          res.status(400).json({
            error:
              "Detalles de remisión inválidos. Faltan campos obligatorios.",
          });
          return;
        }

        const eggType = await AppDataSource.getRepository(EggType).findOneBy({
          id: eggTypeId,
        });
        const supplier = await AppDataSource.getRepository(Supplier).findOneBy({
          id: supplierId,
        });

        if (!eggType || !supplier) {
          res.status(404).json({
            error: `Tipo de huevo o proveedor no encontrado para el detalle.`,
          });
          return;
        }

        if (weights && weights.length !== boxCount) {
          res.status(400).json({
            error: "Para salidas por caja, se requieren los pesos individuales.",
          });
          return;
        }

        // Cálculo del peso total
        const computedWeightTotal = weights
          ? weights.reduce(
              (total: number, weight: number) => total + weight - 2,
              0
            ) // Tara de 2 kg por caja
          : weightTotal;

        if (!computedWeightTotal) {
          res.status(400).json({
            error:
              "Debe proporcionar 'weights' para salidas por caja o 'weightTotal' para salidas por tarima.",
          });
          return;
        }

        // Cálculo del peso estimado por caja para tarima
        const estimatedWeightPerBox = weights
          ? 0
          : parseFloat(
              ((weightTotal - boxCount * 2) / boxCount).toFixed(2)
            );

        // Cálculo del costo total del detalle
        const totalDetailCost = computedWeightTotal * pricePerKilo;

        totalWeight += computedWeightTotal; // Acumular peso total
        totalCost += totalDetailCost; // Acumular costo total

        const remissionDetail = remissionDetailRepository.create({
          remission: savedRemission,
          eggType,
          supplier,
          boxCount,
          isByBox: !!weights, // Si hay pesos, es salida por caja
          weightTotal: computedWeightTotal,
          estimatedWeightPerBox,
          pricePerKilo,
        });

        await remissionDetailRepository.save(remissionDetail);

        // Guardar pesos individuales si es por caja
        if (weights) {
          const boxWeightRepository =
            AppDataSource.getRepository(BoxWeight);

          for (const weight of weights) {
            const boxWeight = boxWeightRepository.create({
              remissionDetail,
              weight: weight - 2, // Tara de 2 kg por caja
            });
            await boxWeightRepository.save(boxWeight);
          }
        }
      }
    }

    // Actualizar peso total y costo total en la remisión
    savedRemission.weightTotal = totalWeight;
    savedRemission.totalCost = totalCost;
    await remissionRepository.save(savedRemission);

    res.status(201).json({
      message: "Remisión creada con éxito.",
      remission: savedRemission,
    });
  } catch (error) {
    console.error("Error al crear la remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const createRemissionDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      remissionId,
      eggTypeId,
      supplierId,
      boxCount,
      isByBox,
      weights,
      weightTotal, // Peso total de la tarima
      pricePerKilo,
    } = req.body;

    if (
      !remissionId ||
      !eggTypeId ||
      !supplierId ||
      !boxCount ||
      !weightTotal ||
      !pricePerKilo ||
      isByBox === undefined
    ) {
      res.status(400).json({
        error: "Todos los campos obligatorios deben estar presentes.",
      });
      return;
    }

    const remission = await AppDataSource.getRepository(Remission).findOne({
      where: { id: remissionId },
      relations: ["details"], // Para actualizar los totales
    });
    if (!remission) {
      res.status(404).json({ error: "Remisión no encontrada." });
      return;
    }

    const eggType = await AppDataSource.getRepository(EggType).findOne({
      where: { id: eggTypeId },
    });
    if (!eggType) {
      res.status(404).json({ error: "Tipo de huevo no encontrado." });
      return;
    }

    const supplier = await AppDataSource.getRepository(Supplier).findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      res.status(404).json({ error: "Proveedor no encontrado." });
      return;
    }

    const remissionDetailRepository =
      AppDataSource.getRepository(RemissionDetail);
    const boxWeightRepository = AppDataSource.getRepository(BoxWeight);

    let calculatedWeightTotal: number;
    let estimatedWeightPerBox: number = 0;

    if (isByBox) {
      // Validación adicional para pesos individuales
      if (!weights || weights.length !== boxCount) {
        res.status(400).json({
          error:
            "Se requieren los pesos individuales para cada caja si la remisión es por caja.",
        });
        return;
      }

      calculatedWeightTotal = weights.reduce(
        (total: number, weight: number) => total + weight - 2,
        0
      ); // Restamos la tara de 2 kg por caja

      // Guardar pesos individuales
      for (const weight of weights) {
        const boxWeight = boxWeightRepository.create({
          remissionDetail: null, // Temporalmente null hasta que guardemos el detalle
          weight: weight - 2, // Restar la tara de 2 kg
        });
        await boxWeightRepository.save(boxWeight);
      }
    } else {
      // Es por tarima
      estimatedWeightPerBox = parseFloat(
        ((weightTotal - boxCount * 2) / boxCount).toFixed(2)
      ); // Peso estimado por caja
      calculatedWeightTotal = weightTotal; // Se toma directamente el peso total
    }

    // Calcular costo total del detalle
    const totalDetailCost = calculatedWeightTotal * pricePerKilo;

    const remissionDetail = remissionDetailRepository.create({
      remission,
      eggType,
      supplier,
      boxCount,
      isByBox,
      weightTotal: calculatedWeightTotal,
      estimatedWeightPerBox,
      pricePerKilo,
    });

    const savedRemissionDetail = await remissionDetailRepository.save(
      remissionDetail
    );

    // Si es por caja, actualizar referencia en boxWeights
    if (isByBox && weights) {
      const savedRemissionDetail = await remissionDetailRepository.save(
        remissionDetail
      );

      for (const weight of weights) {
        const boxWeight = boxWeightRepository.create({
          remissionDetail: savedRemissionDetail, // Asignar el detalle de la remisión después de guardarlo
          weight: weight - 2, // Restar la tara de 2 kg
        });
        await boxWeightRepository.save(boxWeight);
      }
    }

    // Actualizar los totales de la remisión
    remission.weightTotal =
      remission.details.reduce((sum, detail) => sum + detail.weightTotal, 0) +
      calculatedWeightTotal;

    remission.totalCost =
      remission.details.reduce(
        (sum, detail) => sum + detail.pricePerKilo * detail.weightTotal,
        0
      ) + totalDetailCost;

    await AppDataSource.getRepository(Remission).save(remission);

    res.status(201).json({
      message: "Detalle de remisión creado con éxito.",
      remissionDetail: savedRemissionDetail,
    });
  } catch (error) {
    console.error("Error al crear el detalle de remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getRemissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const remissions = await AppDataSource.getRepository(Remission).find({
      relations: ["client", "details", "paymentDetails"],
    });
    res.status(200).json(remissions);
  } catch (error) {
    console.error("Error al obtener las remisiones:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getRemissionDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const remissionDetail = await AppDataSource.getRepository(
      RemissionDetail
    ).findOne({
      where: { id: parseInt(id, 10) },
      relations: ["boxWeights", "eggType", "supplier", "remission"],
    });

    if (!remissionDetail) {
      res.status(404).json({ error: "Detalle de remisión no encontrado." });
      return;
    }

    res.status(200).json(remissionDetail);
  } catch (error) {
    console.error("Error al obtener el detalle de remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getRemissionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = await remissionRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: [
        "client",
        "details",
        "paymentDetails",
        "paymentDetails.payment",
      ],
    });

    if (!remission) {
      res.status(404).json({ error: "Remisión no encontrada." });
      return;
    }

    res.status(200).json(remission);
  } catch (error) {
    console.error("Error al obtener la remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const filterRemissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;
    const remissionRepository = AppDataSource.getRepository(Remission);
    const query = remissionRepository
      .createQueryBuilder("remission")
      .leftJoinAndSelect("remission.client", "client")
      .leftJoinAndSelect("remission.details", "details");

    if (startDate && endDate) {
      query.andWhere("remission.date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    if (clientId) {
      query.andWhere("client.id = :clientId", { clientId });
    }

    const remissions = await query.getMany();
    res.json(remissions);
  } catch (error) {
    console.error("Error filtering remissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateRemissionDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      boxCount,
      isByBox,
      weights,
      estimatedWeightPerBox,
      pricePerKilo,
    } = req.body;

    const remissionDetailRepository =
      AppDataSource.getRepository(RemissionDetail);
    const boxWeightRepository = AppDataSource.getRepository(BoxWeight);

    const remissionDetail = await remissionDetailRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["boxWeights", "remission"],
    });

    if (!remissionDetail) {
      res.status(404).json({ error: "Detalle de remisión no encontrado." });
      return;
    }

    // Actualizar campos básicos
    remissionDetail.boxCount = boxCount || remissionDetail.boxCount;
    remissionDetail.isByBox =
      isByBox !== undefined ? isByBox : remissionDetail.isByBox;
    remissionDetail.estimatedWeightPerBox = isByBox
      ? 0
      : estimatedWeightPerBox || remissionDetail.estimatedWeightPerBox;

    let weightTotal = 0;

    if (isByBox && weights) {
      // Si es por caja, eliminar pesos antiguos y calcular nuevos
      await boxWeightRepository.delete({ remissionDetail });
      weightTotal = weights.reduce(
        (total: number, weight: number) => total + weight - 2, // Tara de 2 kg por caja
        0
      );

      for (const weight of weights) {
        const boxWeight = boxWeightRepository.create({
          remissionDetail,
          weight: weight - 2,
        });
        await boxWeightRepository.save(boxWeight);
      }
    } else if (!isByBox) {
      // Si no es por caja, calcular peso total basado en el peso estimado por caja
      weightTotal = remissionDetail.estimatedWeightPerBox * remissionDetail.boxCount;
    }

    remissionDetail.weightTotal = weightTotal;
    remissionDetail.pricePerKilo = pricePerKilo || remissionDetail.pricePerKilo;

    // Actualizar costo total basado en el peso total y el precio por kilo
    const totalDetailCost = weightTotal * remissionDetail.pricePerKilo;

    // Actualizar el detalle de la remisión
    await remissionDetailRepository.save(remissionDetail);

    // Actualizar el costo total de la remisión principal
    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = remissionDetail.remission;
    remission.totalCost =
      (remission.totalCost || 0) -
      remissionDetail.weightTotal * remissionDetail.pricePerKilo + // Costo anterior
      totalDetailCost; // Costo actualizado
    await remissionRepository.save(remission);

    res.status(200).json({
      message: "Detalle de remisión actualizado con éxito.",
      remissionDetail,
    });
  } catch (error) {
    console.error("Error al actualizar el detalle de remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const updateRemission = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { date, clientId } = req.body;

  try {
    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = await remissionRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["details"], // Para actualizar el costo total en caso de cambios
    });

    if (!remission) {
      res.status(404).json({ error: "Remisión no encontrada." });
      return;
    }

    remission.date = date || remission.date;

    if (clientId) {
      const client = await AppDataSource.getRepository(Client).findOneBy({
        id: clientId,
      });
      if (!client) {
        res.status(404).json({ error: "Cliente no encontrado." });
        return;
      }
      remission.client = client;
    }

    // Recalcular el costo total basado en los detalles
    remission.totalCost = remission.details.reduce(
      (total, detail) => total + detail.weightTotal * detail.pricePerKilo,
      0
    );

    await remissionRepository.save(remission);

    res.status(200).json({
      message: "Remisión actualizada con éxito.",
      remission,
    });
  } catch (error) {
    console.error("Error al actualizar la remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deleteRemission = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = await remissionRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["paymentDetails"],
    });

    if (!remission) {
      res.status(404).json({ error: "Remisión no encontrada." });
      return;
    }

    // Eliminar detalles de pago relacionados
    for (const paymentDetail of remission.paymentDetails) {
      await AppDataSource.getRepository(PaymentDetail).remove(paymentDetail);
    }

    // Eliminar la remisión
    await remissionRepository.remove(remission);

    res.status(200).json({ message: "Remisión eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
