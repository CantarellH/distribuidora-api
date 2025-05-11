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

    let totalWeight = 0;
    let totalCost = 0;

    if (details && Array.isArray(details)) {
      const remissionDetailRepository = AppDataSource.getRepository(RemissionDetail);
      const eggTypeRepository = AppDataSource.getRepository(EggType);

      // Validación previa de stock
      for (const detail of details) {
        const { eggTypeId, boxCount } = detail;
        const eggType = await eggTypeRepository.findOneBy({ id: eggTypeId });
        
        if (eggType && eggType.currentStock < boxCount) {
          res.status(400).json({
            error: `Stock insuficiente para ${eggType.name}. Disponible: ${eggType.currentStock}, Solicitado: ${boxCount}`,
          });
          return;
        }
      }

      // Procesar detalles
      for (const detail of details) {
        const {
          eggTypeId,
          supplierId,
          boxCount,
          weights,
          weightTotal,
          pricePerKilo,
        } = detail;

        const eggType = await eggTypeRepository.findOneBy({ id: eggTypeId });
        const supplier = await AppDataSource.getRepository(Supplier).findOneBy({
          id: supplierId,
        });

        if (!eggType || !supplier) {
          res.status(404).json({
            error: `Tipo de huevo o proveedor no encontrado.`,
          });
          return;
        }

        if (weights && weights.length !== boxCount) {
          res.status(400).json({
            error: "La cantidad de pesos no coincide con el número de cajas.",
          });
          return;
        }

        const computedWeightTotal = weights
          ? weights.reduce((total: number, weight: number) => total + weight - 2, 0)
          : weightTotal;

        if (!computedWeightTotal) {
          res.status(400).json({
            error: "Peso total inválido.",
          });
          return;
        }

        const estimatedWeightPerBox = weights
          ? 0
          : parseFloat(((weightTotal - boxCount * 2) / boxCount).toFixed(2));

        const totalDetailCost = computedWeightTotal * pricePerKilo;

        const remissionDetail = remissionDetailRepository.create({
          remission: savedRemission,
          eggType,
          supplier,
          boxCount,
          isByBox: !!weights,
          weightTotal: computedWeightTotal,
          estimatedWeightPerBox,
          pricePerKilo,
        });

        await remissionDetailRepository.save(remissionDetail);

        // Actualizar stock
        eggType.currentStock -= boxCount;
        await eggTypeRepository.save(eggType);

        if (weights) {
          const boxWeightRepository = AppDataSource.getRepository(BoxWeight);
          for (const weight of weights) {
            await boxWeightRepository.save(
              boxWeightRepository.create({
                remissionDetail,
                weight: weight - 2,
              })
            );
          }
        }

        totalWeight += computedWeightTotal;
        totalCost += totalDetailCost;
      }
    }

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
      weightTotal,
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
      relations: ["details"],
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

    // Validar stock
    if (eggType.currentStock < boxCount) {
      res.status(400).json({
        error: `Stock insuficiente. Solo hay ${eggType.currentStock} disponibles.`,
      });
      return;
    }

    const remissionDetailRepository =
      AppDataSource.getRepository(RemissionDetail);
    const boxWeightRepository = AppDataSource.getRepository(BoxWeight);

    let calculatedWeightTotal: number;
    let estimatedWeightPerBox: number = 0;

    if (isByBox) {
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
      );

      for (const weight of weights) {
        const boxWeight = boxWeightRepository.create({
          remissionDetail: null,
          weight: weight - 2,
        });
        await boxWeightRepository.save(boxWeight);
      }
    } else {
      estimatedWeightPerBox = parseFloat(
        ((weightTotal - boxCount * 2) / boxCount).toFixed(2)
      );
      calculatedWeightTotal = weightTotal;
    }

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

    // Actualizar stock
    eggType.currentStock -= boxCount;
    await AppDataSource.getRepository(EggType).save(eggType);

    if (isByBox && weights) {
      for (const weight of weights) {
        const boxWeight = boxWeightRepository.create({
          remissionDetail: savedRemissionDetail,
          weight: weight - 2,
        });
        await boxWeightRepository.save(boxWeight);
      }
    }

    remission.weightTotal =
      (remission.weightTotal || 0) + calculatedWeightTotal;
    remission.totalCost =
      (remission.totalCost || 0) + totalDetailCost;
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
    const eggTypeRepository = AppDataSource.getRepository(EggType);

    const remissionDetail = await remissionDetailRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["boxWeights", "remission", "eggType"],
    });

    if (!remissionDetail) {
      res.status(404).json({ error: "Detalle de remisión no encontrado." });
      return;
    }

    const eggType = remissionDetail.eggType;
    const originalBoxCount = remissionDetail.boxCount;

    // Validar stock si se modifica la cantidad
    if (boxCount && boxCount !== originalBoxCount) {
      const stockDifference = boxCount - originalBoxCount;
      if (eggType.currentStock < stockDifference) {
        res.status(400).json({
          error: `Stock insuficiente. Disponible: ${eggType.currentStock}, Necesario: ${stockDifference}`,
        });
        return;
      }
    }

    remissionDetail.boxCount = boxCount || remissionDetail.boxCount;
    remissionDetail.isByBox =
      isByBox !== undefined ? isByBox : remissionDetail.isByBox;
    remissionDetail.estimatedWeightPerBox = isByBox
      ? 0
      : estimatedWeightPerBox || remissionDetail.estimatedWeightPerBox;

    let weightTotal = 0;

    if (isByBox && weights) {
      await boxWeightRepository.delete({ remissionDetail: { id: remissionDetail.id } });
      weightTotal = weights.reduce(
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
      weightTotal = remissionDetail.estimatedWeightPerBox * remissionDetail.boxCount;
    }

    remissionDetail.weightTotal = weightTotal;
    remissionDetail.pricePerKilo = pricePerKilo || remissionDetail.pricePerKilo;

    // Actualizar stock si cambió la cantidad
    if (boxCount && boxCount !== originalBoxCount) {
      const stockDifference = boxCount - originalBoxCount;
      eggType.currentStock -= stockDifference;
      await eggTypeRepository.save(eggType);
    }

    await remissionDetailRepository.save(remissionDetail);

    const remissionRepository = AppDataSource.getRepository(Remission);
    const remission = remissionDetail.remission;
    remission.totalCost = remission.details.reduce(
      (sum, detail) => sum + detail.weightTotal * detail.pricePerKilo,
      0
    );
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
      relations: ["details"],
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
      relations: ["paymentDetails", "details", "details.eggType"],
    });

    if (!remission) {
      res.status(404).json({ error: "Remisión no encontrada." });
      return;
    }

    // Revertir stock
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    for (const detail of remission.details) {
      const eggType = await eggTypeRepository.findOneBy({ id: detail.eggType.id });
      if (eggType) {
        eggType.currentStock += detail.boxCount;
        await eggTypeRepository.save(eggType);
      }
    }

    await AppDataSource.getRepository(PaymentDetail).delete({
      remission: { id: remission.id },
    });

    await remissionRepository.remove(remission);

    res.status(200).json({ message: "Remisión eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la remisión:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};