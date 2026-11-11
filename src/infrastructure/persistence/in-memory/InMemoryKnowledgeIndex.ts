import type { ChunkMatch, IndexedChunk, KnowledgeIndex } from "@/application/ports/KnowledgeIndex";
import type { EntityId } from "@/domain/value-objects/EntityId";

// La misma similitud del coseno que calcula pgvector, sobre un array normal: suficiente para los tests
// unitarios.
export class InMemoryKnowledgeIndex implements KnowledgeIndex {
  private entries: IndexedChunk[] = [];

  replaceTopic(topicId: EntityId, entries: IndexedChunk[]): Promise<void> {
    this.entries = [...this.entries.filter((entry) => entry.chunk.topicId !== topicId), ...structuredClone(entries)];
    return Promise.resolve();
  }

  removeTopic(topicId: EntityId): Promise<void> {
    return this.replaceTopic(topicId, []);
  }

  search(embedding: number[], limit: number): Promise<ChunkMatch[]> {
    const matches = this.entries
      .map((entry) => ({ chunk: structuredClone(entry.chunk), similarity: cosineSimilarity(embedding, entry.embedding) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return Promise.resolve(matches);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let lengthA = 0;
  let lengthB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    lengthA += a[i] * a[i];
    lengthB += b[i] * b[i];
  }
  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
}
