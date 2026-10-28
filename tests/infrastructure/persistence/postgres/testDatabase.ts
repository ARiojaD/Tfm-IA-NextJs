import { afterAll } from "vitest";
import type { Seed } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";
import { aTopic } from "../../../fixtures/historicalTopics";
import { truncateAllTables } from "./prepareTestDatabase";
import { testDatabaseUrl } from "./testDatabaseUrl";

const connection = createDatabase(testDatabaseUrl(), { maxConnections: 1 });
afterAll(() => connection.close());

export const testDb = connection.db;

// Topic ids the contract tests hang events, quizzes, comments and recommendations from. In PostgreSQL
// those rows need their topic to exist (foreign keys), so placeholder topics are created for them.
const CONTRACT_TOPIC_IDS = ["topic-1", "topic-caesar", "topic-pericles", "topic-persian-wars"];

// Empties every table and loads the given data. Without topics, the placeholder topics are created.
export async function resetDatabase(seed: Partial<Seed> = {}) {
  await truncateAllTables(testDb);
  const topics = seed.topics ?? CONTRACT_TOPIC_IDS.map((id) => aTopic({ id, slug: id }));
  await insertSeed(testDb, { ...seed, topics });
}
