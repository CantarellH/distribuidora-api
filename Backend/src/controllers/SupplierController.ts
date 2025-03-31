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
    const { name, phone_number, email, address } = req.body;

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

    const newSupplier = supplierRepository.create({ name, phone_number, email, address });
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
    const { name, email, address, phone_number } = req.body;

    const supplierRepository = AppDataSource.getRepository(Supplier);

    // Verificar si el proveedor existe
    const supplier = await supplierRepository.findOneBy({
      id: parseInt(id, 10),
    });

    if (!supplier) {
      res.status(404).json({ error: "Proveedor no encontrado." });
      return;
    }

    // Verificar si el nuevo nombre ya existe en otro proveedor
    if (name) {
      const existingSupplier = await supplierRepository.findOneBy({ name });

      if (existingSupplier && existingSupplier.id !== supplier.id) {
        res
          .status(400)
          .json({ error: "Ya existe un proveedor con este nombre." });
        return;
      }
    }

    // Actualizar los campos del proveedor
    supplier.name = name || supplier.name;
    supplier.phone_number = phone_number || supplier.phone_number;
    supplier.email = email || supplier.email;
    supplier.address = address || supplier.address;

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

export const filterSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contact_info } = req.query;

    const supplierRepository = AppDataSource.getRepository(Supplier);

    // Construir consulta dinámica
    const query = supplierRepository.createQueryBuilder("supplier");

    // Filtrar por nombre si se proporciona
    if (name) {
      query.andWhere("supplier.name ILIKE :name", { name: `%${name}%` });
    }

    // Filtrar por información de contacto si se proporciona
    if (contact_info) {
      query.andWhere("supplier.contact_info ILIKE :contact_info", {
        contact_info: `%${contact_info}%`,
      });
    }

    // Ejecutar la consulta
    const suppliers = await query.getMany();

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error al filtrar proveedores:", error);
    res.status(500).json({ error: "Error al filtrar proveedores." });
  }
};
