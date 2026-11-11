import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

// Abre un pool de conexiones a PostgreSQL. Todas las consultas pasan por Drizzle, que siempre envía los
// valores como parámetros, nunca concatenados en el texto SQL (OWASP A03, inyección SQL).
export function createDatabase(url: string, options: { maxConnections?: number } = {}) {
  const client = postgres(url, { max: options.maxConnections ?? 10, onnotice: () => {} });

  return {
    db: drizzle({ client, schema }),
    close: () => client.end(),
  };
}
