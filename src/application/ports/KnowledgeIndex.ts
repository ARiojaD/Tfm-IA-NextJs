import type { KnowledgeChunk } from "@/domain/entities/KnowledgeChunk";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Un fragmento con su vector, listo para guardarse en el índice.
export interface IndexedChunk {
  chunk: KnowledgeChunk;
  embedding: number[];
}

// Un fragmento encontrado en una búsqueda, con lo que se parece a la pregunta.
export interface ChunkMatch {
  chunk: KnowledgeChunk;
  // Similitud del coseno con la pregunta: 1 es el mismo significado y 0, nada en común.
  similarity: number;
}

// Los fragmentos de los temas publicados con sus vectores (en la aplicación, pgvector). Cada tema se
// indexa entero: lo que no está en su lista nueva desaparece, así un párrafo editado nunca queda dos veces.
export interface KnowledgeIndex {
  // Sustituye todos los fragmentos del tema. Los demás temas nunca se tocan.
  replaceTopic(topicId: EntityId, entries: IndexedChunk[]): Promise<void>;
  // Cuando el tema vuelve a borrador o se borra.
  removeTopic(topicId: EntityId): Promise<void>;
  // Los `limit` fragmentos más parecidos al vector, del más parecido al menos.
  search(embedding: number[], limit: number): Promise<ChunkMatch[]>;
}
