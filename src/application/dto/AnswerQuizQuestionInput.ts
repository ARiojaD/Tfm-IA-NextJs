import { z } from "zod";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { SlugSchema } from "@/domain/value-objects/Slug";

// Lo que envía el navegador cuando un jugador elige una opción. Nunca es de fiar: llega por una Server
// Action pública.
export const AnswerQuizQuestionInputSchema = z.strictObject({
  topicSlug: SlugSchema,
  questionId: EntityIdSchema,
  optionIndex: z.number().int().min(0),
});

export type AnswerQuizQuestionInput = z.infer<typeof AnswerQuizQuestionInputSchema>;
