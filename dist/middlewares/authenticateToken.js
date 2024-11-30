"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No autorizado' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'tu_secreto', (err, user) => {
        if (err) {
            res.status(403).json({ error: 'Token inválido o expirado' });
            return;
        }
        const expirationTime = user.exp * 1000; // Convertir a ms
        const currentTime = Date.now();
        const timeRemaining = expirationTime - currentTime;
        // Si quedan menos de 1 minuto, renovamos el token
        if (timeRemaining < 60 * 1000) {
            const newToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'tu_secreto', { expiresIn: '20' });
            res.setHeader('Authorization', `Bearer ${newToken}`);
        }
        req.user = user; // Asignar usuario al request
        next();
    });
};
exports.authenticateToken = authenticateToken;
