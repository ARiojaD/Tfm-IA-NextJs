import { z } from "zod";

// Qué se recomienda en un tema. Los nombres que ve el lector están en `lib/recommendationTypeLabels.ts`.
export const RECOMMENDATION_TYPES = ["BOOK", "FILM", "SERIES"] as const;

export const RecommendationTypeSchema = z.enum(RECOMMENDATION_TYPES);

export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;
