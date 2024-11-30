"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (roles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        //console.log('Rol requerido:', roles); // Imprime los roles esperados
        // console.log('Rol del usuario:', userRole); // Imprime el rol del usuario autenticado
        if (!roles.includes(userRole)) {
            res.status(403).json({ error: 'No tienes permiso para acceder a esta ruta' });
            return;
        }
        next();
    };
};
exports.checkRole = checkRole;
