import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Supplier } from "../models/Supplier";

export const getSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const suppliers = await supplierRepository.find();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener proveedores." });
  }
};

export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contact_info } = req.body;

    if (!name) {
      res
        .status(400)
        .json({ error: "El nombre del proveedor es obligatorio." });
      return;
    }

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const existingSupplier = await supplierRepository.findOneBy({ name });

    if (existingSupplier) {
      res.status(400).json({ error: "El proveedor ya existe." });
      return;
    }

    const newSupplier = supplierRepository.create({ name, contact_info });
    const savedSupplier = await supplierRepository.save(newSupplier);

    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear proveedor." });
  }
};

export const updateSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, contact_info } = req.body;

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const supplier = await supplierRepository.findOneBy({
      id: parseInt(id, 10),
    });

    if (!supplier) {
      res.status(404).json({ error: "Proveedor no encontrado." });
      return;
    }

    supplier.name = name || supplier.name;
    supplier.contact_info = contact_info || supplier.contact_info;

    const updatedSupplier = await supplierRepository.save(supplier);

    res.status(200).json(updatedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar proveedor." });
  }
};

export const deleteSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const supplierRepository = AppDataSource.getRepository(Supplier);
    const supplier = await supplierRepository.findOneBy({
      id: parseInt(id, 10),
    });

    if (!supplier) {
      res.status(404).json({ error: "Proveedor no encontrado." });
      return;
    }

    await supplierRepository.remove(supplier);

    res.status(200).json({ message: "Proveedor eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar proveedor." });
  }
};
