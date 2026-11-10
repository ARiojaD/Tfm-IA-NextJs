import type { AskQuestionInput } from "../dto/AskQuestionInput";

export class InvalidQuestionError extends Error {
  constructor(
    readonly fieldErrors: Partial<Record<keyof AskQuestionInput, string[]>>,
    readonly formErrors: string[] = [],
  ) {
    super("La pregunta no es válida");
    this.name = "InvalidQuestionError";
  }
}
