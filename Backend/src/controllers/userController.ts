import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types"; // Importa el tipo
import { AppDataSource } from "../config/data-source";
import { Role } from "../models/Role";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";

interface JwtPayload {
  id: number;
  role: string;
}

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, role, status } = req.body;

    if (!username || !password || !role) {
      res
        .status(400)
        .json({
          error: "Faltan campos obligatorios (username, password, role)",
        });
      return;
    }

    const roleRepository = AppDataSource.getRepository(Role);

    const roleId = parseInt(role, 10);
    if (isNaN(roleId)) {
      res.status(400).json({ error: "El rol debe ser un número válido" });
      return;
    }

    const userRole = await roleRepository.findOneBy({ id: roleId });

    // Agrega este console.log
    //console.log("Rol obtenido para el usuario:", userRole);

    if (!userRole) {
      res.status(400).json({ error: "El rol especificado no existe" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRepository = AppDataSource.getRepository(User);

    const newUser = userRepository.create({
      username,
      password: hashedPassword,
      role: userRole,
      status: status === undefined ? true : status,
    });

    const savedUser = await userRepository.save(newUser);

    res
      .status(201)
      .json({ message: "Usuario creado con éxito", user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Validación de los datos de entrada para crear un usuario
export const validateCreateUser = [
  body("username")
    .isString()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio"),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
  body("role").isNumeric().withMessage("El rol debe ser un número válido"),
];

// Manejo de errores de validación
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

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { username },
      relations: ["role"], // ✅ Asegurar que incluimos el rol
    });

    if (!user) {
      res.status(400).json({ error: "Credenciales inválidas" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(400).json({ error: "Credenciales inválidas" });
      return;
    }

    // ✅ Incluir el ID, username, rol y otros datos necesarios en el token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role.name },
      process.env.JWT_SECRET || "tu_secreto",
      { expiresIn: "5m" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      relations: ['role'], // <--- Aquí cargamos la relación del rol
    });

    // Excluir la contraseña en la respuesta (si tu modelo la incluye)
    const usersWithoutPassword = users.map(({ password, ...rest }) => rest);

    res.status(200).json(usersWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, role, status } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Buscar el usuario por ID
    const user = await userRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    // Actualizar campos dinámicamente
    user.username = username || user.username;
    user.status = status !== undefined ? status : user.status;

    if (role) {
      const roleId = parseInt(role, 10);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "El rol debe ser un número válido" });
        return;
      }
      const userRole = await roleRepository.findOneBy({ id: roleId });
      if (!userRole) {
        res.status(400).json({ error: "El rol especificado no existe" });
        return;
      }
      user.role = userRole;
    }

    // Guardar los cambios
    await userRepository.save(user);

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const { id } = req.params;

    const user = await userRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || "tu_secreto", (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: "Token inválido o expirado" });
      return;
    }

    const user = decoded as JwtPayload; // Especifica que el token es del tipo JwtPayload

    if (!user.id || !user.role) {
      res.status(403).json({ error: "Token inválido, falta información" });
      return;
    }

    // Generar un nuevo token
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "tu_secreto",
      { expiresIn: "5m" } // Renovación por 5 minutos
    );

    res.status(200).json({ token: newToken });
  });
};

export const me = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  res.json({
    id: req.user.id,
    name: req.user.username,
    role: req.user.role,
  });
};