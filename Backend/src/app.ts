import express from "express";
import "reflect-metadata";
import dotenv from "dotenv";
import cors from "cors"; // Importar cors
import roleRoutes from "./routes/roleRoutes";
import userRoutes from "./routes/userRoutes";
import eggtypes from "./routes/eggtypeRoutes";
import suppliers from "./routes/supplierRoutes";
import inventory from "./routes/inventoryRoutes";
import clients from "./routes/clientRoutes";
import remissions from "./routes/remissionsRoutes";
import facturacion from "./routes/facturacionRoutes";
import payments from "./routes/paymentRoutes";
import { join } from "path";
import moduleRoutes from "./routes/moduleRoutes";


dotenv.config({ path: join(__dirname, "../../../.env") }); 

const ENDPOINT = process.env.ENDPOINT || "http://localhost:5175";
const app = express();

// **Habilitar CORS antes de definir las rutas**
app.use(cors({
  origin: ENDPOINT, // Asegurar que coincida con el frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Permitir autenticación con cookies
}));

// **Middleware para JSON**
app.use(express.json());

// **Manejo de opciones (Pre-flight requests)**
app.options('*', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ENDPOINT);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// **Rutas**
app.get("/", (_req, res) => {
  res.send("API funcionando correctamente");
});

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/types", eggtypes);
app.use("/api/suppliers", suppliers);
app.use("/api/inventory", inventory);
app.use("/api/clients", clients);
app.use("/api/remissions", remissions);
app.use("/api/payments", payments);
app.use("/api/facturacion", facturacion);

export default app;
