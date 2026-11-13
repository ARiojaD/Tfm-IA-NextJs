import { describe, expect, it } from "vitest";
import { scaleTicks, timelineDomain, yearToPercent } from "@/lib/antiquityScale";

describe("Escala de la Línea de la Antigüedad", () => {
  it("el rango abarca todas las fechas, redondeado hacia fuera al siglo", () => {
    expect(timelineDomain([-1100, -753, 476])).toEqual({ start: -1100, end: 500 });
    expect(timelineDomain([-776, -146])).toEqual({ start: -800, end: -100 });
  });

  it("sin fechas, usa un rango por defecto en lugar de fallar", () => {
    expect(timelineDomain([])).toEqual({ start: -800, end: 500 });
  });

  it("sitúa cada año en proporción dentro del rango, de 0 a 100", () => {
    const domain = { start: -1000, end: 500 };

    expect(yearToPercent(-1000, domain)).toBe(0);
    expect(yearToPercent(500, domain)).toBe(100);
    expect(yearToPercent(-250, domain)).toBe(50);
  });

  it("nunca se sale del rango, aunque una fecha quede fuera", () => {
    const domain = { start: -800, end: 500 };

    expect(yearToPercent(-1100, domain)).toBe(0);
    expect(yearToPercent(1453, domain)).toBe(100);
  });

  it("pone una marca cada paso, con su etiqueta, y salta el año 0, que no existe", () => {
    expect(scaleTicks({ start: -400, end: 400 }, 200)).toEqual([
      { year: -400, label: "400 a.C." },
      { year: -200, label: "200 a.C." },
      { year: 200, label: "200 d.C." },
      { year: 400, label: "400 d.C." },
    ]);
  });
});
