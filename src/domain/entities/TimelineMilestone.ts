import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalDateSchema } from "../value-objects/HistoricalDate";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";

export const MILESTONE_TITLE_MAX_LENGTH = 120;
export const MILESTONE_DESCRIPTION_MAX_LENGTH = 300;

// Un hito de la cronología completa de una civilización: los momentos clave que ordenan todo lo demás. No
// es un evento de un tema: la cronología puede ir por delante de los temas escritos ("Primera guerra
// púnica" sin tema todavía), y por eso `topicId` es opcional. Cuando el tema existe, el hito enlaza a él.
export const TimelineMilestoneSchema = z.strictObject({
  id: EntityIdSchema,
  era: HistoricalEraSchema,
  date: HistoricalDateSchema,
  title: z.string().trim().min(1).max(MILESTONE_TITLE_MAX_LENGTH),
  // Una frase: la cronología resume, y el detalle está en el tema.
  description: z.string().trim().min(1).max(MILESTONE_DESCRIPTION_MAX_LENGTH),
  topicId: EntityIdSchema.optional(),
});

export type TimelineMilestone = z.infer<typeof TimelineMilestoneSchema>;
