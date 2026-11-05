import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { Database } from "@/infrastructure/persistence/postgres/client";
import { testDatabaseUrl } from "./testDatabaseUrl";

// Shared by the integration tests (Vitest) and the end-to-end tests (Playwright): creates the test
// database if needed and applies the same migrations as the real one.
export async function prepareTestDatabase(): Promise<void> {
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

// Empties every table of the test database.
export async function truncateAllTables(db: Database): Promise<void> {
  await db.execute(
    sql`TRUNCATE topics, topic_relations, historical_events, quizzes, quiz_questions, comments, recommendations,
      users, sessions, accounts, verifications, era_follows, saved_topics, proposals, knowledge_chunks`,
  );
}
