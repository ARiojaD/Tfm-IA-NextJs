import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./tests/infrastructure/persistence/postgres/testDatabaseUrl";

const PORT = 3100;
const FAKE_LLM_PORT = 3101;

// End-to-end tests: the real app in a real browser. They run against a production build on its own
// port, so they never touch the dev server (port 3000), and against the test database (requires
// npm run db:up), which globalSetup resets to the seed data before every run.
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
    // Signs the test author in once and saves the session for the comment tests.
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
      // Variables set here win over .env.local: the app under test uses the test database and the fake model.
      env: { DATABASE_URL: testDatabaseUrl(), LLM_BASE_URL: `http://127.0.0.1:${FAKE_LLM_PORT}/v1` },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
