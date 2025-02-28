import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  target: "es2020",
  format: ["cjs", "esm"],
  entry: ["src/index.ts"],
  outDir: "dist",
  clean: true, // Clean output directory before building
  sourcemap: true,
  bundle: true,
  minify: true,
  treeshake: true,
});
