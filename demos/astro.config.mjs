// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        // Either explicitly externalize it
        external: ["lil-gui"],
        // OR make sure it's properly resolved
      },
    },
  },
});
