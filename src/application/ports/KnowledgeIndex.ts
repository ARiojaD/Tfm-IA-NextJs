import type { KnowledgeChunk } from "@/domain/entities/KnowledgeChunk";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface IndexedChunk {
  chunk: KnowledgeChunk;
  embedding: number[];
}

export interface ChunkMatch {
  chunk: KnowledgeChunk;
  // Cosine similarity with the question: 1 is the same meaning, 0 nothing in common.
  similarity: number;
}

// The fragments of the published topics with their vectors (pgvector in the app). Each topic is indexed
// as a whole: what is not in its new list disappears, so an edited paragraph never stays twice.
export interface KnowledgeIndex {
  // Replaces every fragment of the topic. Other topics are never touched.
  replaceTopic(topicId: EntityId, entries: IndexedChunk[]): Promise<void>;
  // When the topic goes back to draft or is deleted.
  removeTopic(topicId: EntityId): Promise<void>;
  // The `limit` fragments most similar to the vector, most similar first.
  search(embedding: number[], limit: number): Promise<ChunkMatch[]>;
}
