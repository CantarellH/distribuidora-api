import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { EggType } from "../models/EggType";

export const getEggTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const eggTypes = await eggTypeRepository.find();
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
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: "El nombre es obligatorio" });
      return;
    }

    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const newEggType = eggTypeRepository.create({ name, description });
    await eggTypeRepository.save(newEggType);

    res.status(201).json(newEggType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el tipo de huevo" });
  }
};

export const updateEggType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const eggTypeRepository = AppDataSource.getRepository(EggType);
    const eggType = await eggTypeRepository.findOneBy({ id: parseInt(id, 10) });

    if (!eggType) {
      res.status(404).json({ error: "Tipo de huevo no encontrado" });
      return;
    }

    eggType.name = name || eggType.name;
    eggType.description = description || eggType.description;

    await eggTypeRepository.save(eggType);
    res.status(200).json(eggType);
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
