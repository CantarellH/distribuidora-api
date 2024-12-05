"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const eggtypeRoutes_1 = __importDefault(require("./routes/eggtypeRoutes"));
const supplierRoutes_1 = __importDefault(require("./routes/supplierRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const remissionsRoutes_1 = __importDefault(require("./routes/remissionsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.send("API funcionando correctamente");
});
app.use("/api/users", userRoutes_1.default);
app.use("/api/roles", roleRoutes_1.default);
app.use("/api/types", eggtypeRoutes_1.default);
app.use("/api/suppliers", supplierRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
app.use("/api/clients", clientRoutes_1.default);
app.use("/api/remissions", remissionsRoutes_1.default);
exports.default = app;
