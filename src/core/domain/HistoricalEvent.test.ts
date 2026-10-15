import { describe, expect, it } from "vitest";
import { HistoricalEventSchema } from "./HistoricalEvent";

const validEvent = {
  title: "Batalla de Maratón",
  date: { year: -490, month: 9 },
  era: "ANCIENT_GREECE",
  description:
    "Victoria ateniense y platea sobre el ejército persa de Darío I durante la Primera Guerra Médica.",
};

describe("HistoricalEventSchema", () => {
  it("acepta un evento histórico válido", () => {
    const result = HistoricalEventSchema.safeParse(validEvent);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validEvent);
  });

  it("acepta un evento del que solo se conoce el año", () => {
    const result = HistoricalEventSchema.safeParse({
      ...validEvent,
      date: { year: -753 },
      era: "ROMAN",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza un título vacío", () => {
    const result = HistoricalEventSchema.safeParse({ ...validEvent, title: "   " });

    expect(result.success).toBe(false);
  });

  it("rechaza una descripción vacía", () => {
    const result = HistoricalEventSchema.safeParse({ ...validEvent, description: "" });

    expect(result.success).toBe(false);
  });

  it("rechaza un año no entero", () => {
    const result = HistoricalEventSchema.safeParse({
      ...validEvent,
      date: { year: -490.5 },
    });

    expect(result.success).toBe(false);
  });

  it("rechaza el año 0, que no existe en la cronología histórica", () => {
    const result = HistoricalEventSchema.safeParse({ ...validEvent, date: { year: 0 } });

    expect(result.success).toBe(false);
  });

  it("rechaza un mes fuera de rango", () => {
    const result = HistoricalEventSchema.safeParse({
      ...validEvent,
      date: { year: -490, month: 13 },
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una época desconocida", () => {
    const result = HistoricalEventSchema.safeParse({ ...validEvent, era: "ATLANTIS" });

    expect(result.success).toBe(false);
  });

  it("rechaza propiedades no permitidas (prevención de Mass Assignment)", () => {
    const result = HistoricalEventSchema.safeParse({ ...validEvent, userId: "attacker-id" });

    expect(result.success).toBe(false);
  });
});
