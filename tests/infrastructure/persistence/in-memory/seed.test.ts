import { describe, expect, it } from "vitest";
import { CommentSchema } from "@/domain/entities/Comment";
import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";

const ids = (items: { id: string }[]) => items.map((item) => item.id);
const hasDuplicates = (values: string[]) => new Set(values).size !== values.length;

describe("Datos de ejemplo (seed)", () => {
  const topicIds = new Set(ids(SEED.topics));

  it("incluye el tema de Julio César", () => {
    expect(SEED.topics.map((topic) => topic.slug)).toContain("julio-cesar");
  });

  it("todos los datos cumplen los esquemas del dominio", () => {
    expect(() => {
      HistoricalTopicSchema.array().parse(SEED.topics);
      HistoricalEventSchema.array().parse(SEED.events);
      QuizSchema.array().parse(SEED.quizzes);
      CommentSchema.array().parse(SEED.comments);
      RecommendationSchema.array().parse(SEED.recommendations);
    }).not.toThrow();
  });

  it("no repite ids dentro de cada colección", () => {
    for (const collection of [SEED.topics, SEED.events, SEED.quizzes, SEED.comments, SEED.recommendations]) {
      expect(hasDuplicates(ids(collection))).toBe(false);
    }
  });

  it("no repite slugs de temas", () => {
    expect(hasDuplicates(SEED.topics.map((topic) => topic.slug))).toBe(false);
  });

  it("todo lo que cuelga de un tema apunta a un tema existente", () => {
    const children = [...SEED.events, ...SEED.quizzes, ...SEED.comments, ...SEED.recommendations];

    for (const child of children) {
      expect(topicIds, `${child.id} apunta a un tema inexistente: ${child.topicId}`).toContain(child.topicId);
    }
  });

  it("cada tema tiene eventos, un único quiz y recomendaciones", () => {
    for (const topic of SEED.topics) {
      expect(SEED.events.some((event) => event.topicId === topic.id), `${topic.slug} sin eventos`).toBe(true);
      expect(SEED.quizzes.filter((quiz) => quiz.topicId === topic.id), `${topic.slug} sin un único quiz`).toHaveLength(1);
      expect(
        SEED.recommendations.some((recommendation) => recommendation.topicId === topic.id),
        `${topic.slug} sin recomendaciones`,
      ).toBe(true);
    }
  });

  it("los eventos de un tema son de la misma época que el tema", () => {
    for (const event of SEED.events) {
      const topic = SEED.topics.find((candidate) => candidate.id === event.topicId);
      expect(event.era, `${event.id} no coincide con la época de su tema`).toBe(topic?.era);
    }
  });
});
