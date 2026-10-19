import type { Comment } from "@/domain/entities/Comment";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Quiz } from "@/domain/entities/Quiz";
import type { Recommendation } from "@/domain/entities/Recommendation";
import {
  juliusCaesarComments,
  juliusCaesarEvents,
  juliusCaesarQuiz,
  juliusCaesarRecommendations,
  juliusCaesarTopic,
} from "./juliusCaesar";

export interface Seed {
  topics: HistoricalTopic[];
  events: HistoricalEvent[];
  quizzes: Quiz[];
  comments: Comment[];
  recommendations: Recommendation[];
}

// Initial data for the in-memory repositories; later reusable as the database seed.
// A new topic is added by creating its file next to juliusCaesar.ts and listing it here.
export const SEED: Seed = {
  topics: [juliusCaesarTopic],
  events: [...juliusCaesarEvents],
  quizzes: [juliusCaesarQuiz],
  comments: [...juliusCaesarComments],
  recommendations: [...juliusCaesarRecommendations],
};
