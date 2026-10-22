import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { SlugSchema } from "../value-objects/Slug";
import { TopicCategorySchema } from "../value-objects/TopicCategory";

// A historical case (e.g. "Julio César") within an era (civilization) and a category (people,
// battles…). Events, quiz, comments and recommendations all hang from a topic, so every topic
// page shares the same structure.
export const HistoricalTopicSchema = z.strictObject({
  id: EntityIdSchema,
  slug: SlugSchema,
  title: z.string().trim().min(1),
  era: HistoricalEraSchema,
  category: TopicCategorySchema,
  summary: z.string().trim().min(1),
});

export type HistoricalTopic = z.infer<typeof HistoricalTopicSchema>;
