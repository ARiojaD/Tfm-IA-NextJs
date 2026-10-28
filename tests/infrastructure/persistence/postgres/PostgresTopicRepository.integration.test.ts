import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { describeTopicRepositoryContract } from "../../../application/ports/TopicRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeTopicRepositoryContract("PostgresTopicRepository", async (topics) => {
  await resetDatabase({ topics });
  return new PostgresTopicRepository(testDb);
});
