import { z } from "zod";

// El tipo de tema histórico. El orden del array es el orden en que se muestran dentro de cada civilización.
export const TOPIC_CATEGORIES = ["PEOPLE", "WARS_AND_BATTLES", "PERIODS", "CITIES"] as const;

export const TopicCategorySchema = z.enum(TOPIC_CATEGORIES);

export type TopicCategory = z.infer<typeof TopicCategorySchema>;
