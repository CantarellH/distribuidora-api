import app from "./app";
import { AppDataSource } from "./config/data-source";
import { join } from "path";
import dotenv from "dotenv";
import { seedDatabase } from './seeds/seedDatabase.ts';
import { seedAdminDatabase } from './seeds/seedAdminDatabase';

dotenv.config({ path: join(__dirname, "../../../.env") });

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await AppDataSource.initialize(); // Inicializar conexión con la base de datos
    console.log("✅ Base de datos conectada.");

    // Ejecutar Seeder
    await seedDatabase(AppDataSource);
    await seedAdminDatabase(AppDataSource);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  } catch (error: any) {
    console.error("❌ Error starting the server:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
