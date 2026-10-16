import { z } from "zod";

export const HISTORICAL_ERAS = ["ANCIENT_GREECE", "ROMAN", "HISPANIA"] as const;

export const HistoricalEraSchema = z.enum(HISTORICAL_ERAS);

export type HistoricalEra = z.infer<typeof HistoricalEraSchema>;
