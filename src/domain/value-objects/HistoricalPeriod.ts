import { z } from "zod";
import { compareHistoricalDates, HistoricalDateSchema } from "./HistoricalDate";

// Cuándo ocurrió un tema: una vida, una guerra, un gobierno. `end` es opcional para los hechos puntuales
// (un asedio fechado solo por su año) y para las ciudades, que tienen fundación pero no final.
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

// Comparador cronológico para `Array.prototype.sort`: por la fecha de inicio.
export function compareHistoricalPeriods(a: HistoricalPeriod, b: HistoricalPeriod): number {
  return compareHistoricalDates(a.start, b.start);
}
