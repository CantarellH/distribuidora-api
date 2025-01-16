import express from "express";
import "reflect-metadata";
import dotenv from "dotenv";
import roleRoutes from "./routes/roleRoutes";
import userRoutes from "./routes/userRoutes";
import eggtypes from "./routes/eggtypeRoutes";
import suppliers from "./routes/supplierRoutes";
import inventory from "./routes/inventoryRoutes";
import clients from "./routes/clientRoutes";
import remissions from "./routes/remissionsRoutes";
import payments from "./routes/paymentRoutes";

dotenv.config();


const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API funcionando correctamente");
});

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/types", eggtypes);
app.use("/api/suppliers", suppliers);
app.use("/api/inventory", inventory);
app.use("/api/clients", clients);
app.use("/api/remissions", remissions);
app.use("/api/payments", payments);

export default app;
