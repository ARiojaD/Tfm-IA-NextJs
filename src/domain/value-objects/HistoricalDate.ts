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
