import { z } from "zod";

// Un par etiqueta/valor de la ficha de un tema ("Nacimiento", "Lugar", "Resultado"…). Es genérico a
// propósito: un personaje y una batalla necesitan datos distintos, y unos campos fijos por categoría no
// escalarían.
export const KeyFactSchema = z.strictObject({
  label: z.string().trim().min(1).max(40),
  value: z.string().trim().min(1).max(200),
});

export type KeyFact = z.infer<typeof KeyFactSchema>;
