"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.refreshToken = exports.deleteUser = exports.updateUser = exports.getUsers = exports.loginUser = exports.handleValidationErrors = exports.validateCreateUser = exports.createUser = void 0;
const data_source_1 = require("../config/data-source");
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_validator_1 = require("express-validator");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const roleId = parseInt(role, 10);
        if (isNaN(roleId)) {
            res.status(400).json({ error: "El rol debe ser un número válido" });
            return;
        }
        const userRole = yield roleRepository.findOneBy({ id: roleId });
        // Agrega este console.log
        //console.log("Rol obtenido para el usuario:", userRole);
        if (!userRole) {
            res.status(400).json({ error: "El rol especificado no existe" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const newUser = userRepository.create({
            username,
            password: hashedPassword,
            role: userRole,
            status: status === undefined ? true : status,
        });
        const savedUser = yield userRepository.save(newUser);
        res
            .status(201)
            .json({ message: "Usuario creado con éxito", user: savedUser });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.createUser = createUser;
// Validación de los datos de entrada para crear un usuario
exports.validateCreateUser = [
    (0, express_validator_1.body)("username")
        .isString()
        .notEmpty()
        .withMessage("El nombre de usuario es obligatorio"),
    (0, express_validator_1.body)("password")
        .isString()
        .notEmpty()
        .withMessage("La contraseña es obligatoria"),
    (0, express_validator_1.body)("role").isNumeric().withMessage("El rol debe ser un número válido"),
];
// Manejo de errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({
            where: { username },
            relations: ["role"], // ✅ Asegurar que incluimos el rol
        });
        if (!user) {
            res.status(400).json({ error: "Credenciales inválidas" });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(400).json({ error: "Credenciales inválidas" });
            return;
        }
        // ✅ Incluir el ID, username, rol y otros datos necesarios en el token
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role.name }, process.env.JWT_SECRET || "tu_secreto", { expiresIn: "5m" });
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.loginUser = loginUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const users = yield userRepository.find({
            relations: ['role'], // <--- Aquí cargamos la relación del rol
        });
        // Excluir la contraseña en la respuesta (si tu modelo la incluye)
        const usersWithoutPassword = users.map((_a) => {
            var { password } = _a, rest = __rest(_a, ["password"]);
            return rest;
        });
        res.status(200).json(usersWithoutPassword);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUsers = getUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username, role, status } = req.body;
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const roleRepository = data_source_1.AppDataSource.getRepository(Role_1.Role);
        // Buscar el usuario por ID
        const user = yield userRepository.findOne({
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
            const userRole = yield roleRepository.findOneBy({ id: roleId });
            if (!userRole) {
                res.status(400).json({ error: "El rol especificado no existe" });
                return;
            }
            user.role = userRole;
        }
        // Guardar los cambios
        yield userRepository.save(user);
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const { id } = req.params;
        const user = yield userRepository.findOne({
            where: { id: parseInt(id, 10) },
        });
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        yield userRepository.remove(user);
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteUser = deleteUser;
const refreshToken = (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "No autorizado" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "tu_secreto", (err, decoded) => {
        if (err || !decoded) {
            res.status(403).json({ error: "Token inválido o expirado" });
            return;
        }
        const user = decoded; // Especifica que el token es del tipo JwtPayload
        if (!user.id || !user.role) {
            res.status(403).json({ error: "Token inválido, falta información" });
            return;
        }
        // Generar un nuevo token
        const newToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "tu_secreto", { expiresIn: "5m" } // Renovación por 5 minutos
        );
        res.status(200).json({ token: newToken });
    });
};
exports.refreshToken = refreshToken;
const me = (req, res) => {
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
exports.me = me;
