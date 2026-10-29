import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { parseDatabaseEnv } from "./src/composition/env";

// drizzle-kit does not read .env.local on its own (Next.js does). Variables already set in the shell win.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/persistence/postgres/schema.ts",
  out: "./src/infrastructure/persistence/postgres/migrations",
  dbCredentials: { url: parseDatabaseEnv(process.env).DATABASE_URL },
  strict: true,
  verbose: true,
});
