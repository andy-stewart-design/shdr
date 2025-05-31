import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
    },
    coverage: {
      provider: "v8",
      exclude: ["**/demos/**", "**/dist/**", "**/*.config.ts"],
    },
  },
});
