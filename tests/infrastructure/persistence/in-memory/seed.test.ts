import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CommentSchema } from "@/domain/entities/Comment";
import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { QuizSchema } from "@/domain/entities/Quiz";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import { TimelineMilestoneSchema } from "@/domain/entities/TimelineMilestone";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";

const ids = (items: { id: string }[]) => items.map((item) => item.id);
const hasDuplicates = (values: string[]) => new Set(values).size !== values.length;

describe("Datos de ejemplo (seed)", () => {
  const topicIds = new Set(ids(SEED.topics));

  it("incluye un personaje y una batalla de Roma: Julio César y el asedio de Alesia", () => {
    const slugs = SEED.topics.map((topic) => topic.slug);

    expect(slugs).toEqual(expect.arrayContaining(["julio-cesar", "asedio-de-alesia"]));
  });

  it("incluye temas de las tres civilizaciones", () => {
    expect(new Set(SEED.topics.map((topic) => topic.era))).toEqual(new Set(["ROMAN", "ANCIENT_GREECE", "HISPANIA"]));
  });

  it("todos los temas tienen imagen", () => {
    for (const topic of SEED.topics) {
      expect(topic.image, `${topic.slug} sin imagen`).toBeDefined();
    }
  });

  it("todos los temas están publicados", () => {
    for (const topic of SEED.topics) {
      expect(topic.status, `${topic.slug} no está publicado`).toBe("PUBLISHED");
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

  it("los temas relacionados van ordenados por id, como los devuelve PostgreSQL", () => {
    for (const topic of SEED.topics) {
      expect(topic.relatedTopicIds, topic.slug).toEqual([...topic.relatedTopicIds].sort());
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

  describe("cronología completa de cada civilización", () => {
    it("cada civilización tiene su cronología: Roma completa, y Grecia e Hispania con sus momentos clave", () => {
      const countByEra = (era: string) => SEED.milestones.filter((milestone) => milestone.era === era).length;

      expect(countByEra("ROMAN")).toBeGreaterThanOrEqual(25);
      expect(countByEra("ANCIENT_GREECE")).toBeGreaterThanOrEqual(12);
      expect(countByEra("HISPANIA")).toBeGreaterThanOrEqual(12);
    });

    it("la de Roma va de la fundación (753 a.C.) a la caída del Imperio de Occidente (476 d.C.)", () => {
      const romanYears = SEED.milestones.filter((milestone) => milestone.era === "ROMAN").map((milestone) => milestone.date.year);

      expect(Math.min(...romanYears)).toBe(-753);
      expect(Math.max(...romanYears)).toBe(476);
    });

    it("los hitos cumplen el esquema del dominio y no repiten id", () => {
      expect(() => TimelineMilestoneSchema.array().parse(SEED.milestones)).not.toThrow();
      expect(hasDuplicates(ids(SEED.milestones))).toBe(false);
    });

    it("los hitos enlazados apuntan a un tema existente de su misma civilización", () => {
      for (const milestone of SEED.milestones) {
        if (milestone.topicId === undefined) continue;
        const topic = SEED.topics.find((candidate) => candidate.id === milestone.topicId);
        expect(topic, `${milestone.id} enlaza a un tema inexistente: ${milestone.topicId}`).toBeDefined();
        expect(topic?.era, `${milestone.id} enlaza a un tema de otra civilización`).toBe(milestone.era);
      }
    });

    it("cada tema publicado aparece enlazado al menos desde un hito de su civilización", () => {
      const linked = new Set(SEED.milestones.flatMap((milestone) => milestone.topicId ?? []));

      for (const topic of SEED.topics) {
        expect(linked, `ningún hito enlaza a ${topic.slug}`).toContain(topic.id);
      }
    });

    it("cada hito cae dentro del periodo del tema al que enlaza", () => {
      for (const milestone of SEED.milestones) {
        const topic = SEED.topics.find((candidate) => candidate.id === milestone.topicId);
        if (!topic) continue;
        const { start, end = start } = topic.period;
        expect(
          milestone.date.year >= start.year && milestone.date.year <= end.year,
          `${milestone.id} (${milestone.date.year}) queda fuera del periodo de ${topic.slug}`,
        ).toBe(true);
      }
    });
  });
});
