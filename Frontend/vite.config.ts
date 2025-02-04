import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".ts", ".jsx", ".tsx",".js",], // Asegura que Vite busque .tsx correctamente
  },
});
