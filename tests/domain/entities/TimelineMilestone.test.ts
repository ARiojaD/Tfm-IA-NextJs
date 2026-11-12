import { describe, expect, it } from "vitest";
import { TimelineMilestoneSchema } from "@/domain/entities/TimelineMilestone";

const foundation = {
  id: "milestone-rome-foundation",
  era: "ROMAN",
  date: { year: -753, month: 4 },
  title: "Fundación de Roma",
  description: "Según la tradición, Rómulo traza los límites de la ciudad sobre el Palatino.",
  topicId: "topic-romulus",
};

describe("TimelineMilestoneSchema", () => {
  it("acepta un hito enlazado a un tema", () => {
    const result = TimelineMilestoneSchema.safeParse(foundation);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(foundation);
  });

  it("acepta un hito sin tema: la cronología puede ir por delante de los temas escritos", () => {
    const punicWar = {
      id: "milestone-first-punic-war",
      era: "ROMAN",
      date: { year: -264 },
      title: "Primera guerra púnica",
      description: "Roma y Cartago se enfrentan por el control de Sicilia.",
    };

    expect(TimelineMilestoneSchema.safeParse(punicWar).success).toBe(true);
  });

  it("rechaza el año 0, que no existe en la cronología histórica", () => {
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, date: { year: 0 } }).success).toBe(false);
  });

  it("rechaza una civilización desconocida", () => {
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, era: "ATLANTIS" }).success).toBe(false);
  });

  it("rechaza un título vacío o de más de 120 caracteres", () => {
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, title: "  " }).success).toBe(false);
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, title: "a".repeat(121) }).success).toBe(false);
  });

  it("rechaza una descripción vacía o de más de 300 caracteres: es una frase, no un tema", () => {
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, description: "" }).success).toBe(false);
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, description: "a".repeat(301) }).success).toBe(false);
  });

  it("rechaza un tema enlazado vacío", () => {
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, topicId: "" }).success).toBe(false);
  });

  it("rechaza propiedades no permitidas (prevención de Mass Assignment)", () => {
    expect(TimelineMilestoneSchema.safeParse({ ...foundation, userId: "attacker-id" }).success).toBe(false);
  });
});
