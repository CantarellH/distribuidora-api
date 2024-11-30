import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { InventoryEntry } from "../models/InventoryEntry";
import { InventoryEntryDetail } from "../models/InventoryEntryDetail";
import { Supplier } from "../models/Supplier";
import { EggType } from "../models/EggType";

export const createInventoryEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId, details } = req.body;

    if (!supplierId || !Array.isArray(details)) {
      res
        .status(400)
        .json({ error: "Se requiere supplierId y un array de detalles." });
      return;
    }

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const eggTypeRepository = AppDataSource.getRepository(EggType);

    const supplier = await supplierRepository.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      res.status(404).json({ error: "Proveedor no encontrado." });
      return;
    }

    const inventoryRepository = AppDataSource.getRepository(InventoryEntry);
    const detailRepository = AppDataSource.getRepository(InventoryEntryDetail);

    // Crear entrada de inventario
    const newEntry = inventoryRepository.create({ supplier });
    await inventoryRepository.save(newEntry);

    // Validar y registrar detalles
    for (const detail of details) {
      const { eggTypeId, boxCount, weightTotal } = detail;

      const eggType = await eggTypeRepository.findOne({
        where: { id: eggTypeId },
      });

      if (!eggType) {
        res
          .status(400)
          .json({ error: `Tipo de huevo con id ${eggTypeId} no encontrado.` });
        return;
      }

      const newDetail = detailRepository.create({
        inventoryEntry: newEntry,
        eggType,
        boxCount,
        weightTotal,
      });

      await detailRepository.save(newDetail);
    }

    res
      .status(201)
      .json({ message: "Entrada de inventario creada con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getInventoryEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const inventoryEntryRepository =
      AppDataSource.getRepository(InventoryEntry);

    const entries = await inventoryEntryRepository.find({
      relations: ["supplier", "details", "details.eggType"],
    });

    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getInventoryEntryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const inventoryEntryRepository =
      AppDataSource.getRepository(InventoryEntry);

    const entry = await inventoryEntryRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["supplier", "details", "details.eggType"],
    });

    if (!entry) {
      res.status(404).json({ error: "Entrada de inventario no encontrada." });
      return;
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const updateInventoryEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { entryDetails } = req.body;

    if (!entryDetails || !Array.isArray(entryDetails)) {
      res
        .status(400)
        .json({
          error: "Los detalles son obligatorios para actualizar la entrada.",
        });
      return;
    }

    // Actualiza la entrada en la base de datos
    const inventoryRepository = AppDataSource.getRepository(InventoryEntry);
    const inventoryDetailRepository =
      AppDataSource.getRepository(InventoryEntryDetail);

    const inventoryEntry = await inventoryRepository.findOne({
      where: { id: Number(id) },
    });
    if (!inventoryEntry) {
      res.status(404).json({ error: "Entrada de inventario no encontrada." });
      return;
    }

    // Elimina los detalles antiguos y agrega los nuevos
    await inventoryDetailRepository.delete({ inventoryEntry });
    const newDetails = entryDetails.map((detail: any) =>
      inventoryDetailRepository.create({
        inventoryEntry,
        eggType: { id: detail.eggTypeId },
        boxCount: detail.boxCount,
        weightTotal: detail.weightTotal,
      })
    );
    await inventoryDetailRepository.save(newDetails);

    res
      .status(200)
      .json({ message: "Entrada de inventario actualizada correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deleteInventoryEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const inventoryEntryRepository =
      AppDataSource.getRepository(InventoryEntry);

    const entry = await inventoryEntryRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!entry) {
      res.status(404).json({ error: "Entrada de inventario no encontrada." });
      return;
    }

    await inventoryEntryRepository.remove(entry);

    res
      .status(200)
      .json({ message: "Entrada de inventario eliminada con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
