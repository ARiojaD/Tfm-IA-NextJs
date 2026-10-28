import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { testDatabaseUrl } from "./testDatabaseUrl";

// Runs once before the integration tests: creates the test database if needed and applies the
// same migrations as the real one, so the tests always see the current schema.
export default async function setup() {
  const url = testDatabaseUrl();
  const databaseName = new URL(url).pathname.slice(1);

  // CREATE DATABASE has to be issued from another database: connect to the default "postgres" one.
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = postgres(adminUrl.toString(), { max: 1, onnotice: () => {} });
  try {
    const existing = await admin`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`;
    if (existing.length === 0) {
      // Identifiers cannot be bound as parameters; the name was checked against /^[a-z0-9_]+_test$/.
      await admin.unsafe(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await admin.end();
  }

  const client = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle({ client }), { migrationsFolder: "src/infrastructure/persistence/postgres/migrations" });
  } finally {
    await client.end();
  }
}
