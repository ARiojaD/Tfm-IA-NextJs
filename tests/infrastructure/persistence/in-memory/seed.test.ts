import { existsSync } from "node:fs";
import { join } from "node:path";
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

  it("incluye un personaje y una batalla de Roma: Julio César y el asedio de Alesia", () => {
    const slugs = SEED.topics.map((topic) => topic.slug);

    expect(slugs).toEqual(expect.arrayContaining(["julio-cesar", "asedio-de-alesia"]));
  });

  it("los dos temas de Roma tienen imagen", () => {
    for (const slug of ["julio-cesar", "asedio-de-alesia"]) {
      expect(SEED.topics.find((topic) => topic.slug === slug)?.image, `${slug} sin imagen`).toBeDefined();
    }
  });

  it("las imágenes de los temas existen en public/", () => {
    for (const topic of SEED.topics) {
      if (!topic.image) continue;
      expect(existsSync(join("public", topic.image.src)), `${topic.slug}: no existe ${topic.image.src}`).toBe(true);
    }
  });

  it("los temas relacionados apuntan a temas existentes", () => {
    for (const topic of SEED.topics) {
      for (const relatedId of topic.relatedTopicIds) {
        expect(topicIds, `${topic.slug} enlaza a un tema inexistente: ${relatedId}`).toContain(relatedId);
      }
    }
  });

  it("las relaciones entre temas son recíprocas", () => {
    for (const topic of SEED.topics) {
      for (const relatedId of topic.relatedTopicIds) {
        const related = SEED.topics.find((candidate) => candidate.id === relatedId);
        expect(related?.relatedTopicIds, `${related?.slug} no enlaza de vuelta a ${topic.slug}`).toContain(topic.id);
      }
    }
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
