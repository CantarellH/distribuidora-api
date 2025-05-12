import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { EggType } from "../models/EggType";
import { Supplier } from "../models/Supplier";
import { EggTypeSupplier } from "../models/EggTypeSupplier";

export const getEggTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const eggTypes = await eggTypeRepository.find({
      relations: ["eggTypeSuppliers.supplier"],
    });
    res.status(200).json(eggTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los tipos de huevo" });
  }
};

export const createEggType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, supplierId, claveSat, unidadSat, claveUnidadSat } = req.body;

    if (!name || !claveSat || !unidadSat || !claveUnidadSat) {
      res.status(400).json({ 
        error: "Nombre, Clave SAT y Unidad SAT son obligatorios" 
      });
      return;
    }

    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const eggTypeSupplierRepository = AppDataSource.getRepository(EggTypeSupplier);

    let supplier = null;
    if (supplierId) {
      supplier = await supplierRepository.findOneBy({ id: supplierId });
      if (!supplier) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }
    }

    const newEggType = eggTypeRepository.create({ 
      name, 
      description, 
      claveSat,
      unidadSat,
      claveUnidadSat
    });
    await eggTypeRepository.save(newEggType);

    if (supplier) {
      const newEggTypeSupplier = eggTypeSupplierRepository.create({
        eggType: newEggType,
        supplier,
      });
      await eggTypeSupplierRepository.save(newEggTypeSupplier);
    }

    const eggTypeWithSuppliers = await eggTypeRepository.findOne({
      where: { id: newEggType.id },
      relations: ["eggTypeSuppliers", "eggTypeSuppliers.supplier"],
    });

    if (!eggTypeWithSuppliers) {
      throw new Error("No se encontró el tipo de huevo con proveedores");
    }

    const response = {
      ...eggTypeWithSuppliers,
      suppliers: eggTypeWithSuppliers.eggTypeSuppliers.map((ets) => ets.supplier),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el tipo de huevo" });
  }
};

export const getSuppliersByEggType = async (req: Request, res: Response) => {
  try {
    const { eggTypeId } = req.params;
    const eggTypeSupplierRepository = AppDataSource.getRepository(EggTypeSupplier);

    const suppliers = await eggTypeSupplierRepository.find({
      where: { eggType: { id: parseInt(eggTypeId, 10) } },
      relations: ["supplier"],
    });

    res.status(200).json(suppliers.map((s) => s.supplier));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener proveedores por tipo de huevo" });
  }
};

export const getEggTypesBySupplier = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const eggTypeSupplierRepository = AppDataSource.getRepository(EggTypeSupplier);

    const eggTypes = await eggTypeSupplierRepository.find({
      where: { supplier: { id: parseInt(supplierId, 10) } },
      relations: ["eggType"],
    });

    res.status(200).json(eggTypes.map((et) => et.eggType));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tipos de huevo por proveedor" });
  }
};

export const updateEggType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, supplierId, claveSat, unidadSat, claveUnidadSat } = req.body;

    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const eggTypeSupplierRepository = AppDataSource.getRepository(EggTypeSupplier);

    const eggType = await eggTypeRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["eggTypeSuppliers"],
    });

    if (!eggType) {
      res.status(404).json({ error: "Tipo de huevo no encontrado" });
      return;
    }

    eggType.name = name || eggType.name;
    eggType.description = description || eggType.description;
    eggType.claveSat = claveSat || eggType.claveSat;
    eggType.unidadSat = unidadSat || eggType.unidadSat;

    await eggTypeRepository.save(eggType);

    if (supplierId) {
      const supplier = await supplierRepository.findOneBy({ id: supplierId });
      if (!supplier) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      await eggTypeSupplierRepository.delete({ eggType: { id: eggType.id } });

      const newEggTypeSupplier = eggTypeSupplierRepository.create({
        eggType,
        supplier,
      });
      await eggTypeSupplierRepository.save(newEggTypeSupplier);
    }

    res.status(200).json({ 
      message: "Tipo de huevo actualizado correctamente", 
      eggType 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el tipo de huevo" });
  }
};

export const deleteEggType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const eggType = await eggTypeRepository.findOneBy({ id: parseInt(id, 10) });

    if (!eggType) {
      res.status(404).json({ error: "Tipo de huevo no encontrado" });
      return;
    }

    await eggTypeRepository.remove(eggType);
    res.status(200).json({ message: "Tipo de huevo eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el tipo de huevo" });
  }
};