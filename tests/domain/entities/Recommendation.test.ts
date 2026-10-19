import { describe, expect, it } from "vitest";
import { RecommendationSchema } from "@/domain/entities/Recommendation";

const validRecommendation = {
  id: "rec-1",
  topicId: "topic-julius-caesar",
  type: "SERIES",
  title: "Roma",
  creator: "HBO / BBC",
  year: 2005,
  description: "Serie ambientada en el final de la República, del regreso de las Galias a la muerte de César.",
};

describe("RecommendationSchema", () => {
  it("acepta una recomendación válida", () => {
    const result = RecommendationSchema.safeParse(validRecommendation);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validRecommendation);
  });

  it.each(["BOOK", "FILM", "SERIES"])("acepta el tipo %s", (type) => {
    expect(RecommendationSchema.safeParse({ ...validRecommendation, type }).success).toBe(true);
  });

  it("rechaza un tipo desconocido", () => {
    expect(RecommendationSchema.safeParse({ ...validRecommendation, type: "PODCAST" }).success).toBe(false);
  });

  it("rechaza un título vacío", () => {
    expect(RecommendationSchema.safeParse({ ...validRecommendation, title: "" }).success).toBe(false);
  });

  it("rechaza un autor o creador vacío", () => {
    expect(RecommendationSchema.safeParse({ ...validRecommendation, creator: " " }).success).toBe(false);
  });

  it("rechaza un año no entero", () => {
    expect(RecommendationSchema.safeParse({ ...validRecommendation, year: 2005.5 }).success).toBe(false);
  });

  it("rechaza propiedades no permitidas", () => {
    expect(RecommendationSchema.safeParse({ ...validRecommendation, price: 9.99 }).success).toBe(false);
  });
});
