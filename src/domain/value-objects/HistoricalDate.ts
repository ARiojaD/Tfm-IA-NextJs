import { z } from "zod";

// Fecha histórica con año y, si se conoce, mes. Los años negativos son antes de Cristo. El año 0 no existe
// en la cronología histórica: al 1 a.C. le sigue el 1 d.C.
export const HistoricalDateSchema = z.strictObject({
  year: z
    .number()
    .int()
    .refine((year) => year !== 0, { message: "El año 0 no existe en la cronología histórica" }),
  month: z.number().int().min(1).max(12).optional(),
});

export type HistoricalDate = z.infer<typeof HistoricalDateSchema>;

// Comparador cronológico para `Array.prototype.sort`. Dentro de un mismo año, una fecha sin mes va
// primero: solo se puede situar al principio de ese año.
export function compareHistoricalDates(a: HistoricalDate, b: HistoricalDate): number {
  return a.year - b.year || (a.month ?? 0) - (b.month ?? 0);
}

export const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

// "490 a.C.", "marzo de 44 a.C.". Está en el dominio, y no en la interfaz, porque el texto que indexa el
// RAG también necesita las fechas escritas como las pregunta la gente, no solo las páginas.
export function formatHistoricalDate({ year, month }: HistoricalDate): string {
  const yearLabel = year < 0 ? `${-year} a.C.` : `${year} d.C.`;

  return month ? `${MONTHS[month - 1]} de ${yearLabel}` : yearLabel;
}
