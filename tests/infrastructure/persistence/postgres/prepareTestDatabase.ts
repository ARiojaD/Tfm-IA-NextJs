import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { Database } from "@/infrastructure/persistence/postgres/client";
import { testDatabaseUrl } from "./testDatabaseUrl";

// Lo comparten los tests de integración (Vitest) y los end-to-end (Playwright): crea la base de datos de
// test si hace falta y aplica las mismas migraciones que en la real.
export async function prepareTestDatabase(): Promise<void> {
  const url = testDatabaseUrl();
  const databaseName = new URL(url).pathname.slice(1);

  // CREATE DATABASE tiene que lanzarse desde otra base de datos: se conecta a la "postgres" por defecto.
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = postgres(adminUrl.toString(), { max: 1, onnotice: () => {} });
  try {
    const existing = await admin`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`;
    if (existing.length === 0) {
      // Los identificadores no se pueden pasar como parámetros; el nombre se comprobó con /^[a-z0-9_]+_test$/.
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

// Vacía todas las tablas de la base de datos de test.
export async function truncateAllTables(db: Database): Promise<void> {
  await db.execute(
    sql`TRUNCATE topics, topic_relations, historical_events, quizzes, quiz_questions, comments, recommendations,
      users, sessions, accounts, verifications, era_follows, saved_topics, proposals, knowledge_chunks, timeline_milestones`,
  );
}
