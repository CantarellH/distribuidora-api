import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "tu_secreto",
    (err, user: any) => {
      if (err) {
        res.status(403).json({ error: "Token inválido o expirado" });
        return;
      }

      const expirationTime = user.exp * 1000; // Convertir a ms
      const currentTime = Date.now();
      const timeRemaining = expirationTime - currentTime;

      // Si quedan menos de 1 minuto, renovamos el token
      if (timeRemaining < 60 * 1000) {
        const newToken = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET || "tu_secreto",
          { expiresIn: "20" }
        );

        res.setHeader("Authorization", `Bearer ${newToken}`);
      }

      req.user = user; // Asignar usuario al request
      next();
    }
  );
};
