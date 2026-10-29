import { afterAll } from "vitest";
import type { Seed } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";
import { users } from "@/infrastructure/persistence/postgres/schema";
import { aTopic } from "../../../fixtures/historicalTopics";
import { truncateAllTables } from "./prepareTestDatabase";
import { testDatabaseUrl } from "./testDatabaseUrl";

const connection = createDatabase(testDatabaseUrl(), { maxConnections: 1 });
afterAll(() => connection.close());

export const testDb = connection.db;

// Topic ids the contract tests hang events, quizzes, comments and recommendations from. In PostgreSQL
// those rows need their topic to exist (foreign keys), so placeholder topics are created for them.
const CONTRACT_TOPIC_IDS = ["topic-1", "topic-caesar", "topic-pericles", "topic-persian-wars"];

// User the contract tests attach comments to (comments.user_id is a foreign key to users).
const CONTRACT_USER_ID = "user-1";

// Empties every table and loads the given data. Without topics, the placeholder topics are created.
export async function resetDatabase(seed: Partial<Seed> = {}) {
  await truncateAllTables(testDb);
  await testDb.insert(users).values({ id: CONTRACT_USER_ID, name: "Usuaria de prueba", email: "user-1@example.com" });
  const topics = seed.topics ?? CONTRACT_TOPIC_IDS.map((id) => aTopic({ id, slug: id }));
  await insertSeed(testDb, { ...seed, topics });
}
