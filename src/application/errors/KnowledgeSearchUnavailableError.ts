// The search could not run (the embedding model or the index failed). The message is for the visitor: the
// technical cause never leaves the server.
export class KnowledgeSearchUnavailableError extends Error {
  constructor() {
    super("Ahora mismo no se puede buscar en la enciclopedia. Inténtalo de nuevo en un momento.");
    this.name = "KnowledgeSearchUnavailableError";
  }
}
