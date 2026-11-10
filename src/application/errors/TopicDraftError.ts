const MESSAGES = {
  NO_TEXT: "Escribe y guarda la introducción o los datos clave antes de pedir una propuesta a la IA.",
  UNAVAILABLE: "La IA no está disponible ahora mismo. Inténtalo de nuevo en un momento.",
  EMPTY: "La IA no ha encontrado nada que proponer a partir de este texto.",
} as const;

// Why the AI could not propose anything. The message is for the administrator: technical causes stay on the server.
export class TopicDraftError extends Error {
  constructor(readonly reason: keyof typeof MESSAGES) {
    super(MESSAGES[reason]);
    this.name = "TopicDraftError";
  }
}
