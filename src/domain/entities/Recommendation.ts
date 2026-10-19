import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { RecommendationTypeSchema } from "../value-objects/RecommendationType";

// A book, film or series recommended for a topic. `creator` is the author, director or studio.
export const RecommendationSchema = z.strictObject({
  id: EntityIdSchema,
  topicId: EntityIdSchema,
  type: RecommendationTypeSchema,
  title: z.string().trim().min(1),
  creator: z.string().trim().min(1),
  year: z.number().int(),
  description: z.string().trim().min(1),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
