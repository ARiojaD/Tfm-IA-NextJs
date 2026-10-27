import { z } from "zod";

// A label/value pair shown in a topic's fact sheet ("Nacimiento", "Lugar", "Resultado"…). Generic on
// purpose: a person and a battle need different facts, and fixed fields per category would not scale.
export const KeyFactSchema = z.strictObject({
  label: z.string().trim().min(1).max(40),
  value: z.string().trim().min(1).max(200),
});

export type KeyFact = z.infer<typeof KeyFactSchema>;
