import { describe, expect, it } from "vitest";
import { compareHistoricalDates, type HistoricalDate } from "@/domain/value-objects/HistoricalDate";

const sortDates = (dates: HistoricalDate[]) => [...dates].sort(compareHistoricalDates);

describe("compareHistoricalDates", () => {
  it("ordena los años antes de Cristo de más antiguo a más reciente", () => {
    expect(sortDates([{ year: -44 }, { year: -100 }, { year: -49 }])).toEqual([
      { year: -100 },
      { year: -49 },
      { year: -44 },
    ]);
  });

  it("coloca los años antes de Cristo antes que los posteriores", () => {
    expect(sortDates([{ year: 14 }, { year: -27 }])).toEqual([{ year: -27 }, { year: 14 }]);
  });

  it("dentro del mismo año, ordena por mes", () => {
    expect(sortDates([{ year: -44, month: 3 }, { year: -44, month: 2 }])).toEqual([
      { year: -44, month: 2 },
      { year: -44, month: 3 },
    ]);
  });

  it("dentro del mismo año, coloca primero la fecha sin mes conocido", () => {
    expect(sortDates([{ year: -44, month: 2 }, { year: -44 }])).toEqual([{ year: -44 }, { year: -44, month: 2 }]);
  });

  it("considera iguales dos fechas idénticas", () => {
    expect(compareHistoricalDates({ year: -44, month: 3 }, { year: -44, month: 3 })).toBe(0);
  });
});
