import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "./src/routes",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
