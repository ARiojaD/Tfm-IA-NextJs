// Convierte texto en vectores que quedan cerca cuando su significado se parece: la base de la búsqueda del
// RAG. Tiene dos métodos porque algunos modelos (la familia E5) esperan los fragmentos y las preguntas
// marcados de forma distinta.
export interface EmbeddingService {
  // Los fragmentos de la enciclopedia, en un solo lote. Un vector por texto, en el mismo orden.
  embedDocuments(texts: string[]): Promise<number[][]>;
  // La pregunta de un visitante.
  embedQuery(text: string): Promise<number[]>;
}
