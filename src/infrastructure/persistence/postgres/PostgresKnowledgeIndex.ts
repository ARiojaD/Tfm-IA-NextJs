import { cosineDistance, eq } from "drizzle-orm";
import type { ChunkMatch, IndexedChunk, KnowledgeIndex } from "@/application/ports/KnowledgeIndex";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toKnowledgeChunk, toKnowledgeChunkRow } from "./mappers";
import { knowledgeChunks } from "./schema";

export class PostgresKnowledgeIndex implements KnowledgeIndex {
  constructor(private readonly db: Database) {}

  // In one transaction: a search never sees a topic half reindexed.
  async replaceTopic(topicId: EntityId, entries: IndexedChunk[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.topicId, topicId));
      if (entries.length > 0) {
        await tx.insert(knowledgeChunks).values(entries.map(({ chunk, embedding }) => toKnowledgeChunkRow(chunk, embedding)));
      }
    });
  }

  async removeTopic(topicId: EntityId): Promise<void> {
    await this.db.delete(knowledgeChunks).where(eq(knowledgeChunks.topicId, topicId));
  }

  // pgvector's cosine distance (<=>), which the HNSW index serves; similarity is 1 - distance.
  async search(embedding: number[], limit: number): Promise<ChunkMatch[]> {
    const distance = cosineDistance(knowledgeChunks.embedding, embedding).mapWith(Number);
    const rows = await this.db
      .select({
        topicId: knowledgeChunks.topicId,
        source: knowledgeChunks.source,
        position: knowledgeChunks.position,
        eventId: knowledgeChunks.eventId,
        content: knowledgeChunks.content,
        distance,
      })
      .from(knowledgeChunks)
      .orderBy(distance)
      .limit(limit);

    return rows.map(({ distance, ...row }) => ({ chunk: toKnowledgeChunk(row), similarity: 1 - distance }));
  }
}
