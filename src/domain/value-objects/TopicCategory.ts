import { z } from "zod";

// The kind of historical topic. The array order is the display order inside each civilization.
export const TOPIC_CATEGORIES = ["PEOPLE", "WARS_AND_BATTLES", "PERIODS", "CITIES"] as const;

export const TopicCategorySchema = z.enum(TOPIC_CATEGORIES);

export type TopicCategory = z.infer<typeof TopicCategorySchema>;
