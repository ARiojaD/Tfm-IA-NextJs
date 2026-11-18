import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Los tests de integración necesitan PostgreSQL: se ejecutan con npm run test:integration (vitest.integration.config.mts).
    exclude: [...configDefaults.exclude, "tests/**/*.integration.test.ts"],
  },
});
