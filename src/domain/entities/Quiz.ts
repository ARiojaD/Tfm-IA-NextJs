import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";

// Una pregunta con sus opciones. Las reglas impiden guardar una pregunta imposible de acertar: opciones
// repetidas o una respuesta correcta que no está entre ellas.
export const QuizQuestionSchema = z
  .strictObject({
    id: EntityIdSchema,
    question: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).min(2),
    correctOptionIndex: z.number().int().min(0),
    explanation: z.string().trim().min(1).optional(),
  })
  .refine(({ options }) => new Set(options).size === options.length, {
    message: "Las opciones de una pregunta no pueden repetirse",
    path: ["options"],
  })
  .refine(({ options, correctOptionIndex }) => correctOptionIndex < options.length, {
    message: "La respuesta correcta debe ser una de las opciones",
    path: ["correctOptionIndex"],
  });

// El quiz de un tema. La respuesta correcta nunca llega al navegador: los casos de uso entregan una versión
// sin ella (`PublicQuiz`) y corrigen en el servidor.
export const QuizSchema = z.strictObject({
  id: EntityIdSchema,
  topicId: EntityIdSchema,
  questions: z.array(QuizQuestionSchema).min(1),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
