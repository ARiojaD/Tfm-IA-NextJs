import { z } from "zod";
import { HistoricalEraSchema } from "@/domain/value-objects/HistoricalEra";

// Lo que envía el botón "Seguir": la civilización y el estado que se quiere (no un interruptor, para que
// un doble clic o una petición repetida dejen el mismo resultado). El usuario sale de la sesión: es
// estricto, así que una petición que intente enviar `userId` se rechaza.
export const UpdateEraFollowInputSchema = z.strictObject({
  era: HistoricalEraSchema,
  intent: z.enum(["follow", "unfollow"]),
});

export type UpdateEraFollowInput = z.infer<typeof UpdateEraFollowInputSchema>;
