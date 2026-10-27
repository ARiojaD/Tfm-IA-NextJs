import { z } from "zod";
import { compareHistoricalDates, HistoricalDateSchema } from "./HistoricalDate";

// When a topic happened: a life, a war, a period of government. `end` is optional for single
// events (a siege dated only by its year) and for cities, which have a foundation but no end.
export const HistoricalPeriodSchema = z
  .strictObject({
    start: HistoricalDateSchema,
    end: HistoricalDateSchema.optional(),
  })
  .refine(({ start, end }) => !end || compareHistoricalDates(start, end) <= 0, {
    message: "Un periodo no puede acabar antes de empezar",
    path: ["end"],
  });

export type HistoricalPeriod = z.infer<typeof HistoricalPeriodSchema>;

// Chronological comparator for Array.prototype.sort: by start date.
export function compareHistoricalPeriods(a: HistoricalPeriod, b: HistoricalPeriod): number {
  return compareHistoricalDates(a.start, b.start);
}
