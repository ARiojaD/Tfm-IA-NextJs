import { existsSync } from "node:fs";
import { parseEnv } from "@/composition/env";

// The test database lives next to the development one, with "_test" appended to its name
// (memnon → memnon_test). TEST_DATABASE_URL overrides it (e.g. in CI). The "_test" suffix is
// mandatory: tests truncate every table, and must never run against real data.
export function testDatabaseUrl(): string {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  const url = process.env.TEST_DATABASE_URL ?? deriveTestUrl(parseEnv(process.env).DATABASE_URL);
  const databaseName = new URL(url).pathname.slice(1);
  if (!/^[a-z0-9_]+_test$/.test(databaseName)) {
    throw new Error(`La base de datos de test debe terminar en "_test" (recibido: "${databaseName}")`);
  }
  return url;
}

function deriveTestUrl(developmentUrl: string): string {
  const url = new URL(developmentUrl);
  url.pathname = `${url.pathname}_test`;
  return url.toString();
}
