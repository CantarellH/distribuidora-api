import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Client } from "../models/Client";

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contact_info } = req.body; // Cambia a contact_info aquí

    if (!name || !contact_info) {
       res
        .status(400)
        .json({
          error: "El nombre y la información de contacto son obligatorios.",
        });
    }

    const clientRepository = AppDataSource.getRepository(Client);

    const newClient = clientRepository.create({
      name,
      contact_info,
      status: true,
    }); // Cambia a contact_info aquí
    const savedClient = await clientRepository.save(newClient);

     res.status(201).json(savedClient);
  } catch (error) {
    console.error(error);
     res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getClients = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);

    const clients = await clientRepository.find({ where: { status: true } });

     res.status(200).json(clients);
  } catch (error) {
    console.error(error);
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