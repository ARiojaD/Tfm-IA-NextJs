import { parseAuthEnv } from "@/composition/env";
import { BetterAuthService } from "@/infrastructure/auth/BetterAuthService";
import { createBetterAuth } from "@/infrastructure/auth/createBetterAuth";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";
import { InMemorySessionCookies } from "../tests/infrastructure/auth/InMemorySessionCookies";
import { prepareTestDatabase, truncateAllTables } from "../tests/infrastructure/persistence/postgres/prepareTestDatabase";
import { testDatabaseUrl } from "../tests/infrastructure/persistence/postgres/testDatabaseUrl";
import { AUTHOR, READER } from "./testUsers";

// Before the end-to-end tests: the app under test (playwright.config.ts) points at the test database,
// which starts every run with exactly the seed data plus the test accounts. Nothing the tests post ever
// reaches the development database.
export default async function globalSetup() {
  await prepareTestDatabase();

  const { db, close } = createDatabase(testDatabaseUrl(), { maxConnections: 1 });
  try {
    await truncateAllTables(db);
    await insertSeed(db, SEED);

    // Created through Better Auth itself, so they are real accounts (scrypt hash, credential provider).
    const betterAuth = createBetterAuth(db, parseAuthEnv(process.env));
    for (const account of [AUTHOR, READER]) {
      const registration = await new BetterAuthService(betterAuth, new InMemorySessionCookies()).register(account);
      if (!registration.ok) throw new Error(`No se pudo crear la cuenta de prueba ${account.email}`);
    }
  } finally {
    await close();
  }
}
