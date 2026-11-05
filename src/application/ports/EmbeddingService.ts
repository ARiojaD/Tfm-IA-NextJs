// Turns text into vectors that are close when their meaning is close: the base of the RAG search. Two
// methods because some models (the E5 family) expect fragments and questions marked differently.
export interface EmbeddingService {
  // The encyclopedia's fragments, in a single batch. One vector per text, in the same order.
  embedDocuments(texts: string[]): Promise<number[][]>;
  // A visitor's question.
  embedQuery(text: string): Promise<number[]>;
}
