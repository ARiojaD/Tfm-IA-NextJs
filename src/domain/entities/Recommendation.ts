import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { RecommendationTypeSchema } from "../value-objects/RecommendationType";

// Un libro, película o serie recomendado en un tema. `creator` es el autor, el director o la productora.
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
