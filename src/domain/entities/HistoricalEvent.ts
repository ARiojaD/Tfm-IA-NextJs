import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalDateSchema } from "../value-objects/HistoricalDate";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";

// Un hito de la cronología de un tema. Se ordenan por fecha, no por el orden en que se escribieron.
export const HistoricalEventSchema = z.strictObject({
  id: EntityIdSchema,
  topicId: EntityIdSchema,
  title: z.string().trim().min(1),
  date: HistoricalDateSchema,
  era: HistoricalEraSchema,
  description: z.string().trim().min(1),
});

export type HistoricalEvent = z.infer<typeof HistoricalEventSchema>;
