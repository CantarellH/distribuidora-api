import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Role } from "../models/Role";

export const checkPermission = (permission: string) => {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        console.log("Usuario no tiene rol asignado. req.user:", req.user);
        res.status(403).json({ error: "No tienes un rol asignado" });
        return;
      }

      // Busca el rol con sus permisos
      const roleRepository = AppDataSource.getRepository(Role);
      const role = await roleRepository.findOne({
        where: { name: userRole },
        relations: ["permissions"],
      });

      if (!role) {
        console.log(
          "Rol no encontrado en la base de datos. userRole:",
          userRole
        );
        res.status(403).json({ error: "Rol no válido" });
        return;
      }

      if (!role.permissions || role.permissions.length === 0) {
        console.log("El rol no tiene permisos asignados. role:", role);
        res
          .status(403)
          .json({ error: "No tienes permisos asignados para este rol" });
        return;
      }

      // Validar si el permiso requerido está en los permisos del rol
      const hasPermission = role.permissions.some((perm) => {
        
        return perm.name === permission;
      });

      if (!hasPermission) {
        console.log("Permiso requerido no encontrado en el rol.");
        console.log("Permisos del rol:", role.permissions);
        res
          .status(403)
          .json({ error: "No tienes permiso para realizar esta acción" });
        return;
      }

      console.log("Permiso encontrado. Continuando...");
      next(); // Continúa con el siguiente middleware si todo está bien
    } catch (error) {
      console.error("Error en checkPermission:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
};
