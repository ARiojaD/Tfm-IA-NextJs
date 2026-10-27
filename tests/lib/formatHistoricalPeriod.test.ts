import { describe, expect, it } from "vitest";
import { formatHistoricalPeriod } from "@/lib/formatHistoricalPeriod";

describe("formatHistoricalPeriod", () => {
  it("muestra solo el año de inicio si el periodo no tiene fin", () => {
    expect(formatHistoricalPeriod({ start: { year: -52 } })).toBe("52 a.C.");
  });

  it("muestra un solo año si empieza y acaba el mismo año", () => {
    expect(formatHistoricalPeriod({ start: { year: -44, month: 2 }, end: { year: -44, month: 3 } })).toBe("44 a.C.");
  });

  it("escribe la era una sola vez si inicio y fin son de la misma era", () => {
    expect(formatHistoricalPeriod({ start: { year: -100, month: 7 }, end: { year: -44, month: 3 } })).toBe(
      "100 – 44 a.C.",
    );
    expect(formatHistoricalPeriod({ start: { year: 14 }, end: { year: 37 } })).toBe("14 – 37 d.C.");
  });

  it("escribe las dos eras si el periodo cruza el cambio de era", () => {
    expect(formatHistoricalPeriod({ start: { year: -63 }, end: { year: 14 } })).toBe("63 a.C. – 14 d.C.");
  });
});
