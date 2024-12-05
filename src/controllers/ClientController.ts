import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Client } from "../models/Client";

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contact_info } = req.body;

    if (!name || !contact_info) {
      res
        .status(400)
        .json({
          error: "El nombre y la información de contacto son obligatorios.",
        });
      return;
    }

    const clientRepository = AppDataSource.getRepository(Client);

    
    const existingClient = await clientRepository.findOne({
      where: [{ name }, { contact_info }],
    });

    if (existingClient) {
      res.status(400).json({
        error: "Ya existe un cliente con el mismo nombre o información de contacto.",
      });
      return;
    }

    const newClient = clientRepository.create({
      name,
      contact_info,
      status: true,
    });

    const savedClient = await clientRepository.save(newClient);

    res.status(201).json(savedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, status, startDate, endDate } = req.query;

    const clientRepository = AppDataSource.getRepository(Client);

    // Crear consulta básica
    const query = clientRepository.createQueryBuilder("client");

    // Filtro por nombre (búsqueda parcial con ILIKE para insensibilidad de mayúsculas)
    if (name) {
      query.andWhere("client.name ILIKE :name", { name: `%${name}%` });
    }

    // Filtro por estado
    if (status !== undefined) {
      const statusBoolean = status === "true";
      query.andWhere("client.status = :status", { status: statusBoolean });
    }

    // Filtro por rango de fechas de creación
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ error: "Fechas inválidas." });
        return;
      }

      query.andWhere("client.created_at BETWEEN :startDate AND :endDate", {
        startDate: parsedStartDate.toISOString(),
        endDate: parsedEndDate.toISOString(),
      });
    }

    // Ejecutar consulta
    const clients = await query.getMany();

    res.status(200).json(clients);
  } catch (error) {
    console.error("Error en la búsqueda de clientes:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


export const getClientById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const clientRepository = AppDataSource.getRepository(Client);

    const client = await clientRepository.findOne({
      where: { id: parseInt(id, 10), status: true },
    });

    if (!client) {
       res.status(404).json({ error: "Cliente no encontrado." });
    }

     res.status(200).json(client);
  } catch (error) {
    console.error(error);
     res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const clientRepository = AppDataSource.getRepository(Client);

  try {
    const client = await clientRepository.findOneBy({ id: parseInt(id, 10) });

    if (!client) {
      res.status(404).json({ error: "El cliente no existe." });
      return; // Detener la ejecución si no se encuentra el cliente
    }

    // Actualizar los campos del cliente
    client.name = req.body.name ?? client.name;
    client.contact_info = req.body.contact_info ?? client.contact_info;

    const updatedClient = await clientRepository.save(client);
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el cliente." });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const clientRepository = AppDataSource.getRepository(Client);
  
    try {
      const client = await clientRepository.findOneBy({ id: parseInt(id, 10) });
  
      if (!client) {
        res.status(404).json({ error: "El cliente no existe." });
        return;
      }
  
      await clientRepository.remove(client);
      res.status(200).json({ message: "Cliente eliminado exitosamente." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar el cliente." });
    }
  };