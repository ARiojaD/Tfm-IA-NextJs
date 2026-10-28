import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Integration tests against a real PostgreSQL (npm run test:integration). Kept apart from the unit tests
// so `npm run test` never needs Docker. They share one test database, so files run one at a time.
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
