import { afterAll } from "vitest";
import type { Seed } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";
import { users } from "@/infrastructure/persistence/postgres/schema";
import { LIBRARY_CONTRACT_TOPICS, LIBRARY_CONTRACT_USERS } from "../../../application/ports/LibraryRepository.contract";
import { ROLE_CONTRACT_USERS } from "../../../application/ports/UserRoleRepository.contract";
import { aTopic } from "../../../fixtures/historicalTopics";
import { truncateAllTables } from "./prepareTestDatabase";
import { testDatabaseUrl } from "./testDatabaseUrl";

const connection = createDatabase(testDatabaseUrl(), { maxConnections: 1 });
afterAll(() => connection.close());

export const testDb = connection.db;

// Topic ids the contract tests hang events, quizzes, comments, recommendations and saved topics from. In
// PostgreSQL those rows need their topic to exist (foreign keys), so placeholder topics are created for them.
const CONTRACT_TOPIC_IDS = [...new Set(["topic-1", "topic-caesar", "topic-pericles", "topic-persian-wars", ...LIBRARY_CONTRACT_TOPICS])];

// Users the contract tests attach comments and libraries to (user_id is a foreign key to users).
const CONTRACT_USER_IDS = [...new Set(["user-1", ...LIBRARY_CONTRACT_USERS, ...ROLE_CONTRACT_USERS])];

// Empties every table and loads the given data. Without topics, the placeholder topics are created.
export async function resetDatabase(seed: Partial<Seed> = {}) {
  await truncateAllTables(testDb);
  await testDb
    .insert(users)
    .values(CONTRACT_USER_IDS.map((id) => ({ id, name: "Usuaria de prueba", email: `${id}@example.com` })));
  const topics = seed.topics ?? CONTRACT_TOPIC_IDS.map((id) => aTopic({ id, slug: id }));
  await insertSeed(testDb, { ...seed, topics });
}
