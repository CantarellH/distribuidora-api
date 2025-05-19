import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Client } from "../models/Client";


interface ClientUpdateFields {
  rfc?: string;
  emailFiscal?: string;
  regimenFiscal?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  codigoPostal?: string;
  alcaldiaMunicipio?: string;
  estado?: string;
  pais?: string;
}

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      name, 
      contact_info,
      // Nuevos campos
      rfc,
      emailFiscal,
      regimenFiscal,
      calle,
      numeroExterior,
      numeroInterior,
      colonia,
      codigoPostal,
      alcaldiaMunicipio,
      estado,
      pais
    } = req.body;

    // Validación básica mejorada
    if (!name || !contact_info) {
      res.status(400).json({
        error: "El nombre y la información de contacto son obligatorios.",
      });
      return;
    }

    // Validación de RFC si se proporciona
    if (rfc && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2}[0-9A]?$/i.test(rfc)) {
  res.status(400).json({ error: "El RFC proporcionado no es válido." });
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
      // Nuevos campos
      rfc,
      emailFiscal,
      regimenFiscal,
      calle,
      numeroExterior,
      numeroInterior,
      colonia,
      codigoPostal,
      alcaldiaMunicipio,
      estado,
      pais: pais || 'México' // Valor por defecto
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
    const { 
      name, 
      status, 
      startDate, 
      endDate,
      rfc, // Nuevo filtro
      codigoPostal // Nuevo filtro
    } = req.query;

    const clientRepository = AppDataSource.getRepository(Client);
    const query = clientRepository.createQueryBuilder("client");

    // Filtros existentes
    if (name) query.andWhere("client.name ILIKE :name", { name: `%${name}%` });
    if (status !== undefined) {
      query.andWhere("client.status = :status", { status: status === "true" });
    }
    if (startDate && endDate) {
      query.andWhere("client.created_at BETWEEN :startDate AND :endDate", {
        startDate: new Date(startDate as string).toISOString(),
        endDate: new Date(endDate as string).toISOString()
      });
    }

    // Nuevos filtros
    if (rfc) query.andWhere("client.rfc = :rfc", { rfc });
    if (codigoPostal) query.andWhere("client.codigoPostal = :codigoPostal", { codigoPostal });

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
    const client = await AppDataSource.getRepository(Client).findOne({
      where: { id: parseInt(id, 10) },
      relations: ['remissions'] // Incluye remisiones relacionadas
    });

    if (!client) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }

    res.status(200).json({
      ...client,
      direccionCompleta: client.getDireccionCompleta() // Método del modelo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOneBy({ id: parseInt(id, 10) });

    if (!client) {
      res.status(404).json({ error: "El cliente no existe." });
      return;
    }

    // Campos básicos
    if (req.body.name) client.name = req.body.name;
    if (req.body.contact_info) client.contact_info = req.body.contact_info;
    if (req.body.status !== undefined) client.status = req.body.status;

    // Campos fiscales
    if (req.body.rfc !== undefined) client.rfc = req.body.rfc;
    if (req.body.emailFiscal !== undefined) client.emailFiscal = req.body.emailFiscal;
    if (req.body.regimenFiscal !== undefined) client.regimenFiscal = req.body.regimenFiscal;

    // Campos de dirección
    if (req.body.calle !== undefined) client.calle = req.body.calle;
    if (req.body.numeroExterior !== undefined) client.numeroExterior = req.body.numeroExterior;
    if (req.body.numeroInterior !== undefined) client.numeroInterior = req.body.numeroInterior;
    if (req.body.colonia !== undefined) client.colonia = req.body.colonia;
    if (req.body.codigoPostal !== undefined) client.codigoPostal = req.body.codigoPostal;
    if (req.body.alcaldiaMunicipio !== undefined) client.alcaldiaMunicipio = req.body.alcaldiaMunicipio;
    if (req.body.estado !== undefined) client.estado = req.body.estado;
    if (req.body.pais !== undefined) client.pais = req.body.pais;

    await clientRepository.save(client);
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};



export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const client = await AppDataSource.getRepository(Client).findOne({
      where: { id: parseInt(id, 10) },
      relations: ['remissions']
    });

    if (!client) {
      res.status(404).json({ error: "El cliente no existe." });
      return;
    }

    // Verificación segura con optional chaining
    const tieneFacturas = client.remissions?.some(r => r.cfdiFolio !== null) ?? false;
    
    if (tieneFacturas) {
      res.status(400).json({ 
        error: "No se puede eliminar, el cliente tiene facturas generadas." 
      });
      return;
    }

    await AppDataSource.getRepository(Client).remove(client);
    res.status(200).json({ message: "Cliente eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el cliente." });
  }
};


export const validateRfc = async (req: Request, res: Response): Promise<void> => {
  const { rfc } = req.body;
  
  if (!rfc) {
    res.status(400).json({ error: "RFC es requerido." });
    return;
  }

  const isValid = /^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][0-9A-Z]([0-9A])?$/.test(rfc);
  res.status(200).json({ valid: isValid });
};