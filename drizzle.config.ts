import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { parseDatabaseEnv } from "./src/composition/env";

// drizzle-kit no lee .env.local por su cuenta (Next.js sí). Las variables que ya estén en la terminal ganan.
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
