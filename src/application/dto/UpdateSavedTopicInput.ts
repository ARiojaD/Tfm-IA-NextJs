import { z } from "zod";
import { SlugSchema } from "@/domain/value-objects/Slug";

// What the "Guardar" button sends: the topic and the state wanted (not a toggle, so a double click or a
// retried request leaves the same result). The user comes from the session: strict, so a request that
// tries to send userId is rejected.
export const UpdateSavedTopicInputSchema = z.strictObject({
  topicSlug: SlugSchema,
  intent: z.enum(["save", "remove"]),
});

export type UpdateSavedTopicInput = z.infer<typeof UpdateSavedTopicInputSchema>;
