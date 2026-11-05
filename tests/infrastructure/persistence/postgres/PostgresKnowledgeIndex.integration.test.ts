import { describe, expect, it } from "vitest";
import { EMBEDDING_DIMENSIONS } from "@/infrastructure/ai/embeddingModel";
import { PostgresKnowledgeIndex } from "@/infrastructure/persistence/postgres/PostgresKnowledgeIndex";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { describeKnowledgeIndexContract } from "../../../application/ports/KnowledgeIndex.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeKnowledgeIndexContract(
  "PostgresKnowledgeIndex",
  async () => {
    await resetDatabase();
    return new PostgresKnowledgeIndex(testDb);
  },
  EMBEDDING_DIMENSIONS,
);

describe("PostgresKnowledgeIndex", () => {
  it("al borrar un tema se borran sus fragmentos", async () => {
    await resetDatabase();
    const index = new PostgresKnowledgeIndex(testDb);
    const embedding = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => (i === 0 ? 1 : 0));
    await index.replaceTopic("topic-caesar", [
      { chunk: { topicId: "topic-caesar", source: "INTRODUCTION", position: 0, content: "Texto." }, embedding },
    ]);

    await new PostgresTopicRepository(testDb).delete("topic-caesar");

    expect(await index.search(embedding, 5)).toEqual([]);
  });
});
