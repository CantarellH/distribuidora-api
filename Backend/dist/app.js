"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors")); // Importar cors
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const eggtypeRoutes_1 = __importDefault(require("./routes/eggtypeRoutes"));
const supplierRoutes_1 = __importDefault(require("./routes/supplierRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const remissionsRoutes_1 = __importDefault(require("./routes/remissionsRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const moduleRoutes_1 = __importDefault(require("./routes/moduleRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// **Habilitar CORS antes de definir las rutas**
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Asegurar que coincida con el frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permitir autenticación con cookies
}));
// **Middleware para JSON**
app.use(express_1.default.json());
// **Manejo de opciones (Pre-flight requests)**
app.options('*', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
});
// **Rutas**
app.get("/", (_req, res) => {
    res.send("API funcionando correctamente");
});
app.use("/api/users", userRoutes_1.default);
app.use("/api/roles", roleRoutes_1.default);
app.use("/api/modules", moduleRoutes_1.default);
app.use("/api/types", eggtypeRoutes_1.default);
app.use("/api/suppliers", supplierRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
app.use("/api/clients", clientRoutes_1.default);
app.use("/api/remissions", remissionsRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
exports.default = app;
