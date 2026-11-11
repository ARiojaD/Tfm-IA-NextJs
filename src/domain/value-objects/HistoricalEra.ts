import { z } from "zod";

// Las civilizaciones que cubre la enciclopedia. Se guardan como claves en inglés; los nombres que ve el
// lector están en `lib/eraLabels.ts`.
export const HISTORICAL_ERAS = ["ANCIENT_GREECE", "ROMAN", "HISPANIA"] as const;

export const HistoricalEraSchema = z.enum(HISTORICAL_ERAS);

export type HistoricalEra = z.infer<typeof HistoricalEraSchema>;
