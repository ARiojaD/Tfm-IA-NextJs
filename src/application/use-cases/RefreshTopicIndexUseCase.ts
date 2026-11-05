import { buildTopicChunks, chunkEmbeddingText } from "@/domain/entities/KnowledgeChunk";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { EmbeddingService } from "../ports/EmbeddingService";
import type { HistoricalEventRepository } from "../ports/HistoricalEventRepository";
import type { KnowledgeIndex } from "../ports/KnowledgeIndex";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";

export interface RefreshTopicIndexDependencies {
  // The editor's view, which sees drafts: a topic that went back to draft must leave the index.
  topicEditor: TopicEditorRepository;
  events: HistoricalEventRepository;
  embeddings: EmbeddingService;
  index: KnowledgeIndex;
}

export interface TopicIndexRefresh {
  indexed: boolean;
  chunks: number;
}

// Brings one topic's fragments in the RAG index up to date with what the web shows. Internal: it runs
// after an admin's edit (already authorized) or from the rebuild script, never from a visitor's request.
export class RefreshTopicIndexUseCase {
  constructor(private readonly dependencies: RefreshTopicIndexDependencies) {}

  async execute(topicId: EntityId): Promise<TopicIndexRefresh> {
    const { topicEditor, events, embeddings, index } = this.dependencies;

    const topic = await topicEditor.findById(topicId);
    if (!topic || topic.status !== "PUBLISHED") {
      await index.removeTopic(topicId);
      return { indexed: false, chunks: 0 };
    }

    const chunks = buildTopicChunks(topic, await events.listByTopic(topicId));
    const vectors = await embeddings.embedDocuments(chunks.map((chunk) => chunkEmbeddingText(topic, chunk)));
    if (vectors.length !== chunks.length) {
      throw new Error(`Se esperaban ${chunks.length} vectores y llegaron ${vectors.length}`);
    }

    await index.replaceTopic(
      topicId,
      chunks.map((chunk, i) => ({ chunk, embedding: vectors[i] })),
    );
    return { indexed: true, chunks: chunks.length };
  }
}
