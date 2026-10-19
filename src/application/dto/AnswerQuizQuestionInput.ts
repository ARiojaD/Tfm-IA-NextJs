import { z } from "zod";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { SlugSchema } from "@/domain/value-objects/Slug";

// What the browser sends when a player picks an option. Never trusted: it arrives through a public Server Action.
export const AnswerQuizQuestionInputSchema = z.strictObject({
  topicSlug: SlugSchema,
  questionId: EntityIdSchema,
  optionIndex: z.number().int().min(0),
});

export type AnswerQuizQuestionInput = z.infer<typeof AnswerQuizQuestionInputSchema>;
