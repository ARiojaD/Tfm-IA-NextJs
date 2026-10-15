import { describe, expect, it } from "vitest";
import { formatHistoricalDate } from "./formatHistoricalDate";

describe("formatHistoricalDate", () => {
  it("formatea un año antes de Cristo", () => {
    expect(formatHistoricalDate({ year: -490 })).toBe("490 a.C.");
  });

  it("formatea un año después de Cristo", () => {
    expect(formatHistoricalDate({ year: 476 })).toBe("476 d.C.");
  });

  it("incluye el mes cuando se conoce", () => {
    expect(formatHistoricalDate({ year: -44, month: 3 })).toBe("marzo de 44 a.C.");
  });
});
