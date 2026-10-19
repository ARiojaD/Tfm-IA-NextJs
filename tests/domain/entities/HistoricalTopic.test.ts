import { describe, expect, it } from "vitest";
import { HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";

const validTopic = {
  id: "topic-julius-caesar",
  slug: "julio-cesar",
  title: "Julio César",
  era: "ROMAN",
  summary: "Del cruce del Rubicón a los Idus de marzo: el general que acabó con la República romana.",
};

describe("HistoricalTopicSchema", () => {
  it("acepta un tema histórico válido", () => {
    const result = HistoricalTopicSchema.safeParse(validTopic);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validTopic);
  });

  it("rechaza un id vacío", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, id: " " }).success).toBe(false);
  });

  it("rechaza un slug que no sirve para una URL", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, slug: "Julio César" }).success).toBe(false);
  });

  it("rechaza un título vacío", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, title: "" }).success).toBe(false);
  });

  it("rechaza una época desconocida", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, era: "ATLANTIS" }).success).toBe(false);
  });

  it("rechaza un resumen vacío", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, summary: "  " }).success).toBe(false);
  });

  it("rechaza propiedades no permitidas", () => {
    expect(HistoricalTopicSchema.safeParse({ ...validTopic, isAdmin: true }).success).toBe(false);
  });
});
