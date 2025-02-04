import app from "./app";
import { AppDataSource } from "./config/data-source";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await AppDataSource.initialize(); // Inicializar conexión con la base de datos

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error("Error starting the server:", error.message);
    console.error(error.stack);
    process.exit(1); 
  }
})();
