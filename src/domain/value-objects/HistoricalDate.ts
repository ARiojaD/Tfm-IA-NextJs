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
