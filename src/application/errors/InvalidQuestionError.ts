import type { AskQuestionInput } from "../dto/AskQuestionInput";

// Fallo de validación de una pregunta a la enciclopedia, con los mensajes listos para el formulario.
export class InvalidQuestionError extends Error {
  constructor(
    readonly fieldErrors: Partial<Record<keyof AskQuestionInput, string[]>>,
    readonly formErrors: string[] = [],
  ) {
    super("La pregunta no es válida");
    this.name = "InvalidQuestionError";
  }
}
