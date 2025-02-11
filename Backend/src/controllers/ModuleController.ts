// controllers/moduleController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { RoleModule } from "../models/RoleModule";
import { Role } from "../models/Role";
import { User } from "../models/User";
// Ajusta si tu archivo se llama realmente Module.ts o Modules.ts
import { Module } from "../models/Modules";

export const getAllModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const moduleRepo = AppDataSource.getRepository(Module);
    const modules = await moduleRepo.find({relations: ["roleModules", "permissions"]});
    res.status(200).json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener módulos" });
  }
};

export const createModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "El módulo necesita un nombre" });
      return;
    }

    const moduleRepo = AppDataSource.getRepository(Module);
    const newModule = moduleRepo.create({ name });
    await moduleRepo.save(newModule);

    res.status(201).json(newModule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el módulo" });
  }
};

export const assignModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roleId, modules } = req.body;
    if (!roleId || !Array.isArray(modules)) {
      res.status(400).json({
        error: "Se requiere roleId y un array de módulos."
      });
      return;
    }

    const roleRepository = AppDataSource.getRepository(Role);
    const roleModuleRepository = AppDataSource.getRepository(RoleModule);

    // Verificar rol
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      res.status(404).json({ error: "El rol especificado no existe." });
      return;
    }

    // Activar o crear la relación en 'role_modules'
    for (const moduleId of modules) {
      let rm = await roleModuleRepository.findOne({
        where: {
          role: { id: roleId },
          module: { id: moduleId },
        },
      });

      if (rm) {
        // Ya existe, solo activamos
        rm.isActive = true;
        await roleModuleRepository.save(rm);
      } else {
        // No existe, lo creamos
        rm = roleModuleRepository.create({
          role: { id: roleId },
          module: { id: moduleId },
          isActive: true,
        });
        await roleModuleRepository.save(rm);
      }
    }

    res.status(200).json({
      message: "Módulos asignados (activados) correctamente."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const removeModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roleId, modules } = req.body;
    if (!roleId || !Array.isArray(modules)) {
      res.status(400).json({
        error: "Se requiere roleId y un array de módulos."
      });
      return;
    }

    const roleRepository = AppDataSource.getRepository(Role);
    const roleModuleRepository = AppDataSource.getRepository(RoleModule);

    // Verificar rol
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      res.status(404).json({ error: "El rol especificado no existe." });
      return;
    }

    // Desactivar la relación en 'role_modules'
    for (const moduleId of modules) {
      const rm = await roleModuleRepository.findOne({
        where: {
          role: { id: roleId },
          module: { id: moduleId },
        },
      });
      if (rm) {
        rm.isActive = false;
        // O podrías hacer: await roleModuleRepository.remove(rm);
        await roleModuleRepository.save(rm);
      }
    }

    res.status(200).json({
      message: "Módulos desactivados correctamente."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getRoleModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roleId } = req.params;
    const roleIdNumber = parseInt(roleId, 10);

    if (isNaN(roleIdNumber)) {
      res.status(400).json({ error: "El ID del rol debe ser un número." });
      return;
    }

    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: roleIdNumber },
      relations: ["roleModules", "roleModules.module"],
    });

    if (!role) {
      res.status(404).json({ error: "Rol no encontrado." });
      return;
    }

    // Filtrar los módulos activos
    const activeModules = role.roleModules
      ?.filter((rm) => rm.isActive)
      .map((rm) => rm.module) ?? [];

    res.status(200).json({
      roleId: role.id,
      name: role.name,
      modules: activeModules,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getUserModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const userIdNumber = parseInt(userId, 10);

    if (isNaN(userIdNumber)) {
      res.status(400).json({ error: "El ID del usuario debe ser un número." });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userIdNumber },
      relations: [
        "role",
        "role.roleModules",
        "role.roleModules.module",
      ],
    });

    if (!user || !user.role) {
      res.status(404).json({ error: "Usuario o rol no encontrado." });
      return;
    }

    // Filtrar los módulos activos
    const activeModules = user.role.roleModules
      ?.filter((rm) => rm.isActive)
      .map((rm) => rm.module) ?? [];

    res.status(200).json({ modules: activeModules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
