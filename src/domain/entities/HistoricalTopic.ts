import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { HistoricalPeriodSchema } from "../value-objects/HistoricalPeriod";
import { KeyFactSchema } from "../value-objects/KeyFact";
import { SlugSchema } from "../value-objects/Slug";
import { TopicCategorySchema } from "../value-objects/TopicCategory";
import { TopicImageSchema } from "../value-objects/TopicImage";

// A historical case (e.g. "Julio César") within an era (civilization) and a category (people,
// battles…). Events, quiz, comments and recommendations all hang from a topic, so every topic
// page shares the same structure. The introduction is also the main text the RAG pipeline will index.
export const HistoricalTopicSchema = z
  .strictObject({
    id: EntityIdSchema,
    slug: SlugSchema,
    title: z.string().trim().min(1),
    era: HistoricalEraSchema,
    category: TopicCategorySchema,
    summary: z.string().trim().min(1),
    period: HistoricalPeriodSchema,
    introduction: z.array(z.string().trim().min(1)).min(1),
    keyFacts: z.array(KeyFactSchema).min(1),
    image: TopicImageSchema.optional(),
    // Links in both directions are stored on each topic (a join table in PostgreSQL).
    relatedTopicIds: z.array(EntityIdSchema),
  })
  .refine(({ relatedTopicIds }) => new Set(relatedTopicIds).size === relatedTopicIds.length, {
    message: "Los temas relacionados no pueden repetirse",
    path: ["relatedTopicIds"],
  })
  .refine(({ id, relatedTopicIds }) => !relatedTopicIds.includes(id), {
    message: "Un tema no puede estar relacionado consigo mismo",
    path: ["relatedTopicIds"],
  });

export type HistoricalTopic = z.infer<typeof HistoricalTopicSchema>;
