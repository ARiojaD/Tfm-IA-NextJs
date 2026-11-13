import { formatHistoricalDate } from "./formatHistoricalDate";

// La escala de la Línea de la Antigüedad de la portada: qué años abarca y en qué punto (de 0 a 100 %) cae
// cada fecha. Es lineal: un siglo ocupa lo mismo en cualquier época, para que se vea de verdad cuánto duró
// cada cosa. El año 0 no existe, pero un año de diferencia no se nota a esta escala.

export interface TimelineDomain {
  start: number;
  end: number;
}

const CENTURY = 100;
const DEFAULT_DOMAIN: TimelineDomain = { start: -800, end: 500 };

// Abarca todas las fechas, redondeado hacia fuera al siglo, para que la escala empiece y acabe en limpio.
export function timelineDomain(years: number[]): TimelineDomain {
  if (years.length === 0) return DEFAULT_DOMAIN;
  return {
    start: Math.floor(Math.min(...years) / CENTURY) * CENTURY,
    end: Math.ceil(Math.max(...years) / CENTURY) * CENTURY,
  };
}

// Dónde cae un año, en porcentaje del ancho. Una fecha fuera del rango se queda en el borde.
export function yearToPercent(year: number, { start, end }: TimelineDomain): number {
  const percent = ((year - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, percent));
}

// Las marcas del eje, cada `step` años, con su etiqueta ("400 a.C."). El año 0 no existe y no se marca.
export function scaleTicks({ start, end }: TimelineDomain, step: number): { year: number; label: string }[] {
  const ticks: { year: number; label: string }[] = [];
  for (let year = Math.ceil(start / step) * step; year <= end; year += step) {
    if (year !== 0) ticks.push({ year, label: formatHistoricalDate({ year }) });
  }
  return ticks;
}
