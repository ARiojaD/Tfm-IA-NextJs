import { z } from "zod";

export const AskQuestionInputSchema = z.strictObject({
  question: z
    .string({ error: "Escribe tu pregunta" })
    .trim()
    .min(3, { error: "Escribe tu pregunta" })
    .max(300, { error: "La pregunta no puede pasar de 300 caracteres" }),
});

export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;
