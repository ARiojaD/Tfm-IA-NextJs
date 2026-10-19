import { z } from "zod";

export const RECOMMENDATION_TYPES = ["BOOK", "FILM", "SERIES"] as const;

export const RecommendationTypeSchema = z.enum(RECOMMENDATION_TYPES);

export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;
