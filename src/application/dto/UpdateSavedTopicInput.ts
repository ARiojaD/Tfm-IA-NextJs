import { z } from "zod";
import { SlugSchema } from "@/domain/value-objects/Slug";

// Lo que envía el botón "Guardar": el tema y el estado que se quiere (no un interruptor, para que un doble
// clic o una petición repetida dejen el mismo resultado). El usuario sale de la sesión: es estricto, así
// que una petición que intente enviar `userId` se rechaza.
export const UpdateSavedTopicInputSchema = z.strictObject({
  topicSlug: SlugSchema,
  intent: z.enum(["save", "remove"]),
});

export type UpdateSavedTopicInput = z.infer<typeof UpdateSavedTopicInputSchema>;
