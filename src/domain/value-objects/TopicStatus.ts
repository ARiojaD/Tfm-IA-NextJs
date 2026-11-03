import { z } from "zod";

// A topic is born as a DRAFT (invisible to the public, can be incomplete) and an admin PUBLISHES it when
// it is ready. Unpublishing takes it back to DRAFT: it disappears from the web but keeps its data.
export const TOPIC_STATUSES = ["DRAFT", "PUBLISHED"] as const;

export const TopicStatusSchema = z.enum(TOPIC_STATUSES);

export type TopicStatus = z.infer<typeof TopicStatusSchema>;
