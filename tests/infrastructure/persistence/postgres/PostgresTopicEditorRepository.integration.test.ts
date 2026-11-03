import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { describeTopicEditorRepositoryContract } from "../../../application/ports/TopicEditorRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeTopicEditorRepositoryContract("PostgresTopicRepository", async (topics) => {
  await resetDatabase({ topics });
  return new PostgresTopicRepository(testDb);
});
