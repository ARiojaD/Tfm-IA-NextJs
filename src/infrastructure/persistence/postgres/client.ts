import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

// Opens a connection pool to PostgreSQL. All queries go through Drizzle, which always sends values
// as bound parameters, never concatenated into the SQL text (OWASP A03, SQL injection).
export function createDatabase(url: string, options: { maxConnections?: number } = {}) {
  const client = postgres(url, { max: options.maxConnections ?? 10, onnotice: () => {} });

  return {
    db: drizzle({ client, schema }),
    close: () => client.end(),
  };
}
