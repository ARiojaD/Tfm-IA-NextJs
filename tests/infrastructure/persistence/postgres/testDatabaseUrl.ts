import { existsSync } from "node:fs";
import { parseDatabaseEnv } from "@/composition/env";

// La base de datos de test vive junto a la de desarrollo, con "_test" añadido a su nombre
// (memnon → memnon_test). TEST_DATABASE_URL la sustituye (por ejemplo, en CI). El sufijo "_test" es
// obligatorio: los tests vacían todas las tablas y nunca deben ejecutarse contra datos reales.
// Se calcula una vez: algunos tests apuntan DATABASE_URL a la base de datos de test, y derivarla otra vez
// de ella añadiría "_test" dos veces.
let cachedUrl: string | undefined;

export function testDatabaseUrl(): string {
  cachedUrl ??= resolveTestDatabaseUrl();
  return cachedUrl;
}

function resolveTestDatabaseUrl(): string {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  const url = process.env.TEST_DATABASE_URL ?? deriveTestUrl(parseDatabaseEnv(process.env).DATABASE_URL);
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
