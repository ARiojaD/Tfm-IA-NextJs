import { beforeAll, describe, expect, it } from "vitest";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";
import { PostgresCommentRepository } from "@/infrastructure/persistence/postgres/PostgresCommentRepository";
import { PostgresHistoricalEventRepository } from "@/infrastructure/persistence/postgres/PostgresHistoricalEventRepository";
import { PostgresQuizRepository } from "@/infrastructure/persistence/postgres/PostgresQuizRepository";
import { PostgresRecommendationRepository } from "@/infrastructure/persistence/postgres/PostgresRecommendationRepository";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { resetDatabase, testDb } from "./testDatabase";

// The real seed (César and Alesia) goes into PostgreSQL and comes back identical: this exercises every
// mapping the contracts' minimal data does not (image, key facts, months, relations, explanations…).
describe("insertSeed con los datos reales", () => {
  beforeAll(() => resetDatabase(SEED));

  it.each(SEED.topics.map((topic) => [topic.slug, topic] as const))("el tema %s vuelve igual", async (slug, topic) => {
    expect(await new PostgresTopicRepository(testDb).findBySlug(slug)).toEqual(topic);
  });

  it("los eventos, quizzes, comentarios y recomendaciones vuelven iguales", async () => {
    for (const topic of SEED.topics) {
      const byTopic = <T extends { topicId: string }>(items: T[]) => items.filter((item) => item.topicId === topic.id);

      expect(await new PostgresHistoricalEventRepository(testDb).listByTopic(topic.id)).toEqual(
        expect.arrayContaining(byTopic(SEED.events)),
      );
      expect(await new PostgresQuizRepository(testDb).findByTopic(topic.id)).toEqual(byTopic(SEED.quizzes)[0]);
      expect(await new PostgresCommentRepository(testDb).listByTopic(topic.id)).toEqual(
        expect.arrayContaining(byTopic(SEED.comments)),
      );
      expect(await new PostgresRecommendationRepository(testDb).listByTopic(topic.id)).toEqual(
        expect.arrayContaining(byTopic(SEED.recommendations)),
      );
    }
  });

  it("insertar el seed encima de sí mismo no duplica nada (se puede relanzar npm run db:seed)", async () => {
    await resetDatabase(SEED);

    await insertSeed(testDb, SEED);

    const caesarId = SEED.topics[0].id;
    expect(await new PostgresTopicRepository(testDb).listByEra("ROMAN")).toHaveLength(SEED.topics.length);
    expect(await new PostgresCommentRepository(testDb).listByTopic(caesarId)).toHaveLength(
      SEED.comments.filter((comment) => comment.topicId === caesarId).length,
    );
  });
});
