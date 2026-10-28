import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";
import { prepareTestDatabase, truncateAllTables } from "../tests/infrastructure/persistence/postgres/prepareTestDatabase";
import { testDatabaseUrl } from "../tests/infrastructure/persistence/postgres/testDatabaseUrl";

// Before the end-to-end tests: the app under test (playwright.config.ts) points at the test database,
// which starts every run with exactly the seed data. Comments posted by the tests never reach the
// development database.
export default async function globalSetup() {
  await prepareTestDatabase();

  const { db, close } = createDatabase(testDatabaseUrl(), { maxConnections: 1 });
  try {
    await truncateAllTables(db);
    await insertSeed(db, SEED);
  } finally {
    await close();
  }
}
