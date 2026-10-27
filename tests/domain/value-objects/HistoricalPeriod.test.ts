import { describe, expect, it } from "vitest";
import { compareHistoricalPeriods, HistoricalPeriodSchema } from "@/domain/value-objects/HistoricalPeriod";

describe("HistoricalPeriodSchema", () => {
  it("acepta un periodo con inicio y fin", () => {
    const life = { start: { year: -100, month: 7 }, end: { year: -44, month: 3 } };

    expect(HistoricalPeriodSchema.parse(life)).toEqual(life);
  });

  it("acepta un periodo sin fin (un hecho puntual o una ciudad que sigue existiendo)", () => {
    expect(HistoricalPeriodSchema.safeParse({ start: { year: -52 } }).success).toBe(true);
  });

  it("acepta un periodo que empieza y acaba en la misma fecha", () => {
    expect(HistoricalPeriodSchema.safeParse({ start: { year: -52 }, end: { year: -52 } }).success).toBe(true);
  });

  it("rechaza un periodo que acaba antes de empezar", () => {
    expect(HistoricalPeriodSchema.safeParse({ start: { year: -44 }, end: { year: -100 } }).success).toBe(false);
  });

  it("rechaza un periodo sin inicio", () => {
    expect(HistoricalPeriodSchema.safeParse({ end: { year: -44 } }).success).toBe(false);
  });

  it("rechaza fechas inválidas dentro del periodo", () => {
    expect(HistoricalPeriodSchema.safeParse({ start: { year: 0 } }).success).toBe(false);
  });
});

describe("compareHistoricalPeriods", () => {
  it("ordena los periodos por su fecha de inicio", () => {
    const empire = { start: { year: -27 } };
    const monarchy = { start: { year: -753 }, end: { year: -509 } };
    const republic = { start: { year: -509 }, end: { year: -27 } };

    expect([empire, republic, monarchy].toSorted(compareHistoricalPeriods)).toEqual([monarchy, republic, empire]);
  });
});
