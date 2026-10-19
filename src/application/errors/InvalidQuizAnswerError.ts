export class InvalidQuizAnswerError extends Error {
  constructor(message = "La respuesta del quiz no es válida") {
    super(message);
    this.name = "InvalidQuizAnswerError";
  }
}
