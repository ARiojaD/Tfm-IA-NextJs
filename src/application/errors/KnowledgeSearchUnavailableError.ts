// La búsqueda no se pudo hacer (falló el modelo de embeddings o el índice). El mensaje es para el
// visitante: la causa técnica nunca sale del servidor.
export class KnowledgeSearchUnavailableError extends Error {
  constructor() {
    super("Ahora mismo no se puede buscar en la enciclopedia. Inténtalo de nuevo en un momento.");
    this.name = "KnowledgeSearchUnavailableError";
  }
}
