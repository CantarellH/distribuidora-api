import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { Permission } from "../models/Permission";
import { body, validationResult } from "express-validator";

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find();
    res.status(200).json(roles); // Enviar respuesta y detener
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener roles" }); // Asegúrate de que se detiene aquí
  }
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const createRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const roleRepository = AppDataSource.getRepository(Role);

    const role = roleRepository.create({ name, description });
    await roleRepository.save(role);

    res.status(201).json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const assignPermissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roleId, permissions } = req.body;

    // Validar datos de entrada
    if (!roleId || !Array.isArray(permissions)) {
      res
        .status(400)
        .json({ error: "Se requiere roleId y un array de permissions." });
      return;
    }

    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);

    // Buscar el rol con sus permisos existentes
    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      res.status(404).json({ error: "El rol especificado no existe." });
      return;
    }

    // Validar que los permisos existan
    const validPermissions = await permissionRepository.findByIds(permissions);

    if (validPermissions.length !== permissions.length) {
      res.status(400).json({ error: "Algunos permisos no son válidos." });
      return;
    }

    // Asegurarte de que permissions no sea undefined
    role.permissions = role.permissions ?? [];

    // Combinar los permisos existentes con los nuevos
    role.permissions = [...role.permissions, ...validPermissions];

    // Guardar los cambios en la base de datos
    await roleRepository.save(role);

    res
      .status(200)
      .json({ message: "Permisos asignados correctamente.", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const removePermissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roleId, permissions } = req.body;

    if (
      !roleId ||
      !Array.isArray(permissions) ||
      permissions.some((p) => typeof p !== "number")
    ) {
      res
        .status(400)
        .json({
          error:
            "Se requiere roleId y un array de permissions con IDs válidos.",
        });
      return;
    }

    const roleRepository = AppDataSource.getRepository(Role);

    const role = await roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions"],
    });

    if (!role) {
      res.status(404).json({ error: "El rol especificado no existe." });
      return;
    }

    // Asegura que permissions no sea undefined
    role.permissions = role.permissions ?? [];

    // Verificar que todos los permisos a remover realmente existen y están asignados al rol
    const existingPermissionIds = new Set(role.permissions.map((p) => p.id));
    const validPermissionsToRemove = permissions.filter((id) =>
      existingPermissionIds.has(id)
    );

    // Filtrar los permisos que no están en la lista para remover
    role.permissions = role.permissions.filter(
      (permission) => !validPermissionsToRemove.includes(permission.id)
    );

    await roleRepository.save(role);

    res
      .status(200)
      .json({ message: "Permisos eliminados correctamente.", role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const getUserPermissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params; // userId es un string aquí

    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber)) {
      res.status(400).json({ error: "El ID del usuario debe ser un número." });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userIdNumber },
      relations: ["role", "role.permissions"],
    });

    if (!user || !user.role) {
      res.status(404).json({ error: "Usuario o rol no encontrado." });
      return;
    }

    const permissions = user.role.permissions;
    res.status(200).json({ permissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};
