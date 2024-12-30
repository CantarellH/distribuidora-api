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

    // Si se incluyen detalles en la solicitud, crear cada uno
    if (details && Array.isArray(details)) {
      const remissionDetailRepository =
        AppDataSource.getRepository(RemissionDetail);

      for (const detail of details) {
        const {
          eggTypeId,
          supplierId,
          boxCount,
          isByBox,
          weights,
          estimatedWeightPerBox,
        } = detail;

        if (!eggTypeId || !supplierId || !boxCount || isByBox === undefined) {
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

        const weightTotal = isByBox
          ? weights.reduce(
              (total: number, weight: number) => total + weight - 2,
              0
            ) // Tara de 2 kg
          : estimatedWeightPerBox * boxCount;

        const remissionDetail = remissionDetailRepository.create({
          remission: savedRemission,
          eggType,
          supplier,
          boxCount,
          isByBox,
          weightTotal,
          estimatedWeightPerBox: isByBox ? 0 : estimatedWeightPerBox,
        });

        await remissionDetailRepository.save(remissionDetail);

        // Guardar pesos individuales si es por caja
        if (isByBox && weights) {
          const boxWeightRepository = AppDataSource.getRepository(BoxWeight);

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

    res
      .status(201)
      .json({
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
      estimatedWeightPerBox,
    } = req.body;

    if (
      !remissionId ||
      !eggTypeId ||
      !supplierId ||
      !boxCount ||
      isByBox === undefined
    ) {
      res.status(400).json({
        error: "Todos los campos obligatorios deben estar presentes.",
      });
      return;
    }

    const remission = await AppDataSource.getRepository(Remission).findOne({
      where: { id: remissionId },
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

    if (isByBox && (!weights || weights.length !== boxCount)) {
      res
        .status(400)
        .json({ error: "Se requieren los pesos individuales para cada caja." });
      return;
    }

    const remissionDetailRepository =
      AppDataSource.getRepository(RemissionDetail);
    const boxWeightRepository = AppDataSource.getRepository(BoxWeight);

    const weightTotal = isByBox
      ? weights.reduce((total: number, weight: number) => total + weight - 2, 0) // Tara de 2 kg por caja
      : estimatedWeightPerBox * boxCount;

    const remissionDetail = remissionDetailRepository.create({
      remission,
      eggType,
      supplier,
      boxCount,
      isByBox,
      weightTotal,
      estimatedWeightPerBox: isByBox ? 0 : estimatedWeightPerBox,
    });

    await remissionDetailRepository.save(remissionDetail);

    if (isByBox && weights) {
      for (const weight of weights) {
        const boxWeight = boxWeightRepository.create({
          remissionDetail,
          weight: weight - 2, // Restar la tara de 2 kg por caja
        });
        await boxWeightRepository.save(boxWeight);
      }
    }

    res.status(201).json({
      message: "Detalle de remisión creado con éxito.",
      remissionDetail,
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
    const { boxCount, isByBox, weights, estimatedWeightPerBox } = req.body;

    const remissionDetailRepository =
      AppDataSource.getRepository(RemissionDetail);
    const boxWeightRepository = AppDataSource.getRepository(BoxWeight);

    const remissionDetail = await remissionDetailRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["boxWeights"],
    });

    if (!remissionDetail) {
      res.status(404).json({ error: "Detalle de remisión no encontrado." });
      return;
    }

    remissionDetail.boxCount = boxCount || remissionDetail.boxCount;
    remissionDetail.isByBox =
      isByBox !== undefined ? isByBox : remissionDetail.isByBox;
    remissionDetail.estimatedWeightPerBox = isByBox
      ? 0
      : estimatedWeightPerBox || remissionDetail.estimatedWeightPerBox;

    if (isByBox && weights) {
      await boxWeightRepository.delete({ remissionDetail }); // Eliminar pesos antiguos
      remissionDetail.weightTotal = weights.reduce(
        (total: number, weight: number) => total + weight - 2,
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
      remissionDetail.weightTotal =
        remissionDetail.estimatedWeightPerBox * remissionDetail.boxCount;
    }

    await remissionDetailRepository.save(remissionDetail);

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

    await remissionRepository.save(remission);

    res
      .status(200)
      .json({ message: "Remisión actualizada con éxito.", remission });
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
