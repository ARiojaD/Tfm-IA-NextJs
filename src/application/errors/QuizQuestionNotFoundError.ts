export class QuizQuestionNotFoundError extends Error {
  constructor(
    readonly topicSlug: string,
    readonly questionId: string,
  ) {
    super(`El tema "${topicSlug}" no tiene ninguna pregunta "${questionId}"`);
    this.name = "QuizQuestionNotFoundError";
  }
}
