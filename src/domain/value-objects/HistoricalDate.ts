import { z } from "zod";

// Negative years are BC. Year 0 does not exist in the historical calendar (1 BC is followed by AD 1).
export const HistoricalDateSchema = z.strictObject({
  year: z
    .number()
    .int()
    .refine((year) => year !== 0, { message: "El año 0 no existe en la cronología histórica" }),
  month: z.number().int().min(1).max(12).optional(),
});

export type HistoricalDate = z.infer<typeof HistoricalDateSchema>;

// Chronological comparator for Array.prototype.sort. Within a year, a date with unknown
// month goes first: it can only be placed at the start of that year.
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

// "490 a.C.", "marzo de 44 a.C.". In the domain because the encyclopedia is in Spanish and its text for
// the RAG needs the dates written as people ask about them, not only the pages.
export function formatHistoricalDate({ year, month }: HistoricalDate): string {
  const yearLabel = year < 0 ? `${-year} a.C.` : `${year} d.C.`;

  return month ? `${MONTHS[month - 1]} de ${yearLabel}` : yearLabel;
}
