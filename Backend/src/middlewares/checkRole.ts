import { Request, Response, NextFunction } from "express";

export const checkRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    //console.log('Rol requerido:', roles); // Imprime los roles esperados
    // console.log('Rol del usuario:', userRole); // Imprime el rol del usuario autenticado
    if (!roles.includes(userRole)) {
      res
        .status(403)
        .json({ error: "No tienes permiso para acceder a esta ruta" });
      return;
    }
    next();
  };
};
