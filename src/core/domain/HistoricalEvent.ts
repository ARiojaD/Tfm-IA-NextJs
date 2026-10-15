import { z } from "zod";

export const HISTORICAL_ERAS = ["ANCIENT_GREECE", "ROMAN", "HISPANIA"] as const;

export const HistoricalEraSchema = z.enum(HISTORICAL_ERAS);

// Negative years are BC. Year 0 does not exist in the historical calendar (1 BC is followed by AD 1).
export const HistoricalDateSchema = z.strictObject({
  year: z
    .number()
    .int()
    .refine((year) => year !== 0, { message: "El año 0 no existe en la cronología histórica" }),
  month: z.number().int().min(1).max(12).optional(),
});

export const HistoricalEventSchema = z.strictObject({
  title: z.string().trim().min(1),
  date: HistoricalDateSchema,
  era: HistoricalEraSchema,
  description: z.string().trim().min(1),
});

export type HistoricalEra = z.infer<typeof HistoricalEraSchema>;
export type HistoricalDate = z.infer<typeof HistoricalDateSchema>;
export type HistoricalEvent = z.infer<typeof HistoricalEventSchema>;
