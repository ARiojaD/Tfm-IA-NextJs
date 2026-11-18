import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests de integración contra un PostgreSQL real (npm run test:integration). Separados de los unitarios
// para que `npm run test` nunca necesite Docker. Comparten una base de datos de test, así que los archivos van de uno en uno.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
    globalSetup: ["tests/infrastructure/persistence/postgres/globalSetup.ts"],
    fileParallelism: false,
  },
});
