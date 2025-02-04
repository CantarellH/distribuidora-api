import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Role } from "../models/Role";
import { User } from "../models/User";
import { Permission } from "../models/Permission";
import { RolePermission } from "../models/RolePermission"; // <-- Importante
import { body, validationResult } from "express-validator";

// 1) Listar todos los roles y, de paso, obtener todos los permisos
//    (Usamos la relación con RolePermission)
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleRepository = AppDataSource.getRepository(Role);
    // Incluir la relación con RolePermission y Permission
    const roles = await roleRepository.find({
      relations: ["rolePermissions", "rolePermissions.permission"],
    });

    // Mapear cada rol para obtener únicamente los permisos activos
    const rolesMapped = roles.map((role) => {
      const activePermissions = role.rolePermissions
        ?.filter((rp) => rp.isActive)
        .map((rp) => rp.permission) ?? [];

      return {
        id: role.id,
        name: role.name,
        description: role.description,
        module: role.roleModules,
        // Sólo los permisos activos
        permissions: activePermissions,
      };
    });

    // Obtener la lista de todos los permisos
    const permissionRepository = AppDataSource.getRepository(Permission);
    const allPermissions = await permissionRepository.find();

    // Devolver roles (con permisos activos) y la lista completa de permisos
    res.status(200).json({
      roles: rolesMapped,
      allPermissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener roles y permisos" });
  }
};

// 2) Middleware genérico de validación (sin cambios)
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

// 3) Crear un nuevo rol (sin cambios)
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

// 4) Asignar permisos a un rol: aquí *activamos* (o creamos) el registro
//    en la tabla 'role_permissions' con isActive = true
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
    const rolePermissionRepository = AppDataSource.getRepository(RolePermission);

    // Verificar si el rol existe
    const role = await roleRepository.findOneBy({ id: roleId });
    if (!role) {
      res.status(404).json({ error: "El rol especificado no existe." });
      return;
    }

    // Activar (o crear) la relación en 'role_permissions'
    for (const permissionId of permissions) {
      // Buscar si ya existe la fila en la tabla pivote
      let rp = await rolePermissionRepository.findOne({
        where: {
          role: { id: roleId },
          permission: { id: permissionId },
        },
      });

      if (rp) {
        // Si ya existe, simplemente activamos isActive
        rp.isActive = true;
        await rolePermissionRepository.save(rp);
      } else {
        // Si no existe, la creamos con isActive = true
        rp = rolePermissionRepository.create({
          role: { id: roleId },
          permission: { id: permissionId },
          isActive: true,
        });
        await rolePermissionRepository.save(rp);
      }
    }

    res
      .status(200)
      .json({ message: "Permisos asignados (activados) correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// 5) Remover (o desactivar) permisos de un rol:
//    aquí pondremos isActive = false, en lugar de eliminar la fila
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
    const rolePermissionRepository = AppDataSource.getRepository(RolePermission);

    // Verificar si el rol existe
    const role = await roleRepository.findOneBy({ id: roleId });
    if (!role) {
      res.status(404).json({ error: "El rol especificado no existe." });
      return;
    }

    // Desactivar la relación en 'role_permissions'
    for (const permissionId of permissions) {
      // Buscar si ya existe la fila en la tabla pivote
      const rp = await rolePermissionRepository.findOne({
        where: {
          role: { id: roleId },
          permission: { id: permissionId },
        },
      });

      // Si existe, se desactiva (isActive = false). 
      // O podrías directamente eliminar la fila con .remove(rp).
      if (rp) {
        rp.isActive = false;
        await rolePermissionRepository.save(rp);
      }
    }

    res
      .status(200)
      .json({ message: "Permisos desactivados correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// 6) Obtener permisos de un usuario según su rol. Como 'role.permissions' 
//    ya no existe, cargamos 'role.rolePermissions' y filtramos isActive.
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

    // Cargamos al usuario con su rol, y al rol con las rolePermissions
    // (y dentro de ellas, la permission asociada)
    const user = await userRepository.findOne({
      where: { id: userIdNumber },
      relations: [
        "role",
        "role.rolePermissions",
        "role.rolePermissions.permission",
      ],
    });

    if (!user || !user.role) {
      res.status(404).json({ error: "Usuario o rol no encontrado." });
      return;
    }

    // Filtrar los que estén isActive = true
    const activePermissions =
      user.role.rolePermissions
        ?.filter((rp) => rp.isActive)
        .map((rp) => rp.permission) ?? [];

    res.status(200).json({ permissions: activePermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// 7) Listar todos los permisos (sin cambios, opcional)
export const getAllPermissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const allPermissions = await permissionRepository.find( {relations: ["module"],});
    res.status(200).json(allPermissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la lista de permisos" });
  }
};
