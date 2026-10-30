import { z } from "zod";
import { HistoricalEraSchema } from "@/domain/value-objects/HistoricalEra";

// What the "Seguir" button sends: the civilization and the state wanted (not a toggle, so a double click
// or a retried request leaves the same result). The user comes from the session: strict, so a request
// that tries to send userId is rejected.
export const UpdateEraFollowInputSchema = z.strictObject({
  era: HistoricalEraSchema,
  intent: z.enum(["follow", "unfollow"]),
});

export type UpdateEraFollowInput = z.infer<typeof UpdateEraFollowInputSchema>;
