import { z } from "zod";

// Identificador opaco, sin atarse a ningún almacenamiento: vale para los ids legibles del seed y para los
// UUID que genera la base de datos.
export const EntityIdSchema = z.string().trim().min(1);

export type EntityId = z.infer<typeof EntityIdSchema>;
