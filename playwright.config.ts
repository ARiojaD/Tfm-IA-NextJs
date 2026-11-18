import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./tests/infrastructure/persistence/postgres/testDatabaseUrl";

const PORT = 3100;
const FAKE_LLM_PORT = 3101;

// Tests end-to-end: la app real en un navegador real. Se ejecutan contra una compilación de producción en
// su propio puerto, así que nunca tocan el servidor de desarrollo (puerto 3000), y contra la base de datos
// de test (requiere npm run db:up), que globalSetup deja con los datos del seed antes de cada ejecución.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/globalSetup.ts",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-ES",
    trace: "retain-on-failure",
  },
  projects: [
    // Inicia sesión una vez con el autor de prueba y guarda la sesión para los tests de comentarios.
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, dependencies: ["setup"] },
  ],
  webServer: [
    {
      command: `npx tsx e2e/fakeLlmServer.ts ${FAKE_LLM_PORT}`,
      url: `http://127.0.0.1:${FAKE_LLM_PORT}`,
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npm run start -- --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      // Las variables de aquí ganan a .env.local: la app que se prueba usa la base de datos de test y el modelo falso.
      env: { DATABASE_URL: testDatabaseUrl(), LLM_BASE_URL: `http://127.0.0.1:${FAKE_LLM_PORT}/v1` },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
