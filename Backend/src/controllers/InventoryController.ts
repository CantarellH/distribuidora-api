import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { InventoryEntry } from "../models/InventoryEntry";
import { InventoryEntryDetail } from "../models/InventoryEntryDetail";
import { Supplier } from "../models/Supplier";
import { EggType } from "../models/EggType";
import { InventoryMovement, MovementType } from "../models/InventoryMovement";

export const createInventoryEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId, details } = req.body;

    if (!supplierId || !Array.isArray(details)) {
      res.status(400).json({ error: "Se requiere supplierId y un array de detalles." });
      return;
    }

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const movementRepository = AppDataSource.getRepository(InventoryMovement);

    const supplier = await supplierRepository.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      res.status(404).json({ error: "Proveedor no encontrado." });
      return;
    }

    const inventoryRepository = AppDataSource.getRepository(InventoryEntry);
    const detailRepository = AppDataSource.getRepository(InventoryEntryDetail);

    const newEntry = inventoryRepository.create({ supplier });
    await inventoryRepository.save(newEntry);

    for (const detail of details) {
      const { eggTypeId, boxCount, weightTotal } = detail;

      const eggType = await eggTypeRepository.findOne({
        where: { id: eggTypeId },
      });

      if (!eggType) {
        res.status(400).json({ error: `Tipo de huevo con id ${eggTypeId} no encontrado.` });
        return;
      }

      const newDetail = detailRepository.create({
        inventoryEntry: newEntry,
        eggType,
        boxCount,
        weightTotal,
      });

      await detailRepository.save(newDetail);

      eggType.currentStock += boxCount;
      await eggTypeRepository.save(eggType);

      const movement = movementRepository.create({
        eggType: eggType,
        movementType: MovementType.ENTRY,
        quantity: boxCount,
        referenceId: newEntry.id,
        currentStock: eggType.currentStock,
        details: `Entrada de inventario desde proveedor ${supplier.name}`
      });
      await movementRepository.save(movement);
    }

    res.status(201).json({ 
      message: "Entrada de inventario creada con éxito.",
      entry: newEntry
    });
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
    const { supplierId, eggTypeId, startDate, endDate } = req.query;

    const inventoryEntryRepository = AppDataSource.getRepository(InventoryEntry);
    const query = inventoryEntryRepository.createQueryBuilder("inventoryEntry");

    query.leftJoinAndSelect("inventoryEntry.supplier", "supplier")
      .leftJoinAndSelect("inventoryEntry.details", "details")
      .leftJoinAndSelect("details.eggType", "eggType");

    if (supplierId) {
      query.andWhere("supplier.id = :supplierId", { supplierId: parseInt(supplierId as string, 10) });
    }

    if (eggTypeId) {
      query.andWhere("eggType.id = :eggTypeId", { eggTypeId: parseInt(eggTypeId as string, 10) });
    }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ error: "Fechas inválidas." });
        return;
      }

      query.andWhere("inventoryEntry.createdAt BETWEEN :startDate AND :endDate", {
        startDate: parsedStartDate.toISOString(),
        endDate: parsedEndDate.toISOString(),
      });
    }

    const entries = await query.getMany();

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
    const inventoryEntryRepository = AppDataSource.getRepository(InventoryEntry);

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
      res.status(400).json({
        error: "Los detalles son obligatorios para actualizar la entrada.",
      });
      return;
    }

    const inventoryRepository = AppDataSource.getRepository(InventoryEntry);
    const inventoryDetailRepository = AppDataSource.getRepository(InventoryEntryDetail);
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const movementRepository = AppDataSource.getRepository(InventoryMovement);

    const inventoryEntry = await inventoryRepository.findOne({
      where: { id: Number(id) },
      relations: ["details", "details.eggType"],
    });
    
    if (!inventoryEntry) {
      res.status(404).json({ error: "Entrada de inventario no encontrada." });
      return;
    }

    for (const oldDetail of inventoryEntry.details) {
      const eggType = await eggTypeRepository.findOneBy({ id: oldDetail.eggType.id });
      if (eggType) {
        eggType.currentStock -= oldDetail.boxCount;
        await eggTypeRepository.save(eggType);
      }
    }
    await inventoryDetailRepository.delete({ inventoryEntry });

    for (const detail of entryDetails) {
      const eggType = await eggTypeRepository.findOneBy({ id: detail.eggTypeId });
      if (!eggType) {
        res.status(400).json({ error: `Tipo de huevo con id ${detail.eggTypeId} no encontrado.` });
        return;
      }

      const newDetail = inventoryDetailRepository.create({
        inventoryEntry,
        eggType,
        boxCount: detail.boxCount,
        weightTotal: detail.weightTotal,
      });

      await inventoryDetailRepository.save(newDetail);

      eggType.currentStock += detail.boxCount;
      await eggTypeRepository.save(eggType);

      const movement = movementRepository.create({
        eggType: eggType,
        movementType: MovementType.ADJUSTMENT,
        quantity: detail.boxCount,
        referenceId: inventoryEntry.id,
        currentStock: eggType.currentStock,
        details: `Ajuste de inventario por actualización de entrada`
      });
      await movementRepository.save(movement);
    }

    res.status(200).json({ 
      message: "Entrada de inventario actualizada correctamente.",
      entry: inventoryEntry
    });
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
    const inventoryEntryRepository = AppDataSource.getRepository(InventoryEntry);
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const movementRepository = AppDataSource.getRepository(InventoryMovement);

    const entry = await inventoryEntryRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["details", "details.eggType"],
    });

    if (!entry) {
      res.status(404).json({ error: "Entrada de inventario no encontrada." });
      return;
    }

    for (const detail of entry.details) {
      const eggType = await eggTypeRepository.findOneBy({ id: detail.eggType.id });
      if (eggType) {
        eggType.currentStock -= detail.boxCount;
        await eggTypeRepository.save(eggType);

        const movement = movementRepository.create({
          eggType: eggType,
          movementType: MovementType.ADJUSTMENT,
          quantity: -detail.boxCount,
          referenceId: entry.id,
          currentStock: eggType.currentStock,
          details: `Reversión de entrada de inventario eliminada`
        });
        await movementRepository.save(movement);
      }
    }

    await inventoryEntryRepository.remove(entry);

    res.status(200).json({ 
      message: "Entrada de inventario eliminada con éxito.",
      deletedEntry: entry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getCurrentStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const eggTypes = await eggTypeRepository.find();

    res.status(200).json(eggTypes.map(eggType => ({
      id: eggType.id,
      name: eggType.name,
      currentStock: eggType.currentStock,
      unit: 'cajas'
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el stock actual." });
  }
};

export const getStockByEggType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const eggTypeRepository = AppDataSource.getRepository(EggType);

    const eggType = await eggTypeRepository.findOne({
      where: { id: parseInt(id, 10) }
    });

    if (!eggType) {
      res.status(404).json({ error: "Tipo de huevo no encontrado." });
      return;
    }

    res.status(200).json({
      id: eggType.id,
      name: eggType.name,
      currentStock: eggType.currentStock,
      unit: 'cajas'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el stock del tipo de huevo." });
  }
};

export const adjustStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eggTypeId, quantity, reason } = req.body;

    if (!eggTypeId || quantity === undefined || !reason) {
      res.status(400).json({ 
        error: "Se requiere eggTypeId, quantity y reason." 
      });
      return;
    }

    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const movementRepository = AppDataSource.getRepository(InventoryMovement);

    const eggType = await eggTypeRepository.findOneBy({ id: eggTypeId });
    if (!eggType) {
      res.status(404).json({ error: "Tipo de huevo no encontrado." });
      return;
    }

    if (eggType.currentStock + quantity < 0) {
      res.status(400).json({ 
        error: `No hay suficiente stock. Stock actual: ${eggType.currentStock}` 
      });
      return;
    }

    const oldStock = eggType.currentStock;
    eggType.currentStock += quantity;
    await eggTypeRepository.save(eggType);

    // Corrección: Omitir referenceId completamente en lugar de pasar null
    const movementData = {
      eggType,
      movementType: quantity > 0 ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT,
      quantity: Math.abs(quantity),
      currentStock: eggType.currentStock,
      details: `Ajuste manual: ${reason}. Stock anterior: ${oldStock}`
    };

    const movement = movementRepository.create(movementData);
    await movementRepository.save(movement);

    res.status(200).json({
      message: "Stock ajustado correctamente.",
      eggTypeId: eggType.id,
      name: eggType.name,
      previousStock: oldStock,
      newStock: eggType.currentStock,
      adjustment: quantity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al ajustar el stock." });
  }
};

export const getInventoryMovements = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eggTypeId, startDate, endDate, movementType } = req.query;
    const movementRepository = AppDataSource.getRepository(InventoryMovement);
    const query = movementRepository.createQueryBuilder("movement")
      .leftJoinAndSelect("movement.eggType", "eggType")
      .orderBy("movement.createdAt", "DESC");

    if (eggTypeId) {
      query.andWhere("eggType.id = :eggTypeId", { 
        eggTypeId: parseInt(eggTypeId as string, 10) 
      });
    }

    if (movementType) {
      query.andWhere("movement.movementType = :movementType", { movementType });
    }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ error: "Fechas inválidas." });
        return;
      }

      query.andWhere("movement.createdAt BETWEEN :startDate AND :endDate", {
        startDate: parsedStartDate.toISOString(),
        endDate: parsedEndDate.toISOString(),
      });
    }

    const movements = await query.getMany();
    res.status(200).json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los movimientos." });
  }
};