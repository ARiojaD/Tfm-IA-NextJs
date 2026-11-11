import { buildTopicChunks, chunkEmbeddingText } from "@/domain/entities/KnowledgeChunk";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { EmbeddingService } from "../ports/EmbeddingService";
import type { HistoricalEventRepository } from "../ports/HistoricalEventRepository";
import type { KnowledgeIndex } from "../ports/KnowledgeIndex";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";

export interface RefreshTopicIndexDependencies {
  // La vista del editor, que ve los borradores: un tema que vuelve a borrador debe salir del índice.
  topicEditor: TopicEditorRepository;
  events: HistoricalEventRepository;
  embeddings: EmbeddingService;
  index: KnowledgeIndex;
}

export interface TopicIndexRefresh {
  indexed: boolean;
  chunks: number;
}

// Pone al día los fragmentos de un tema en el índice del RAG con lo que muestra la web. Es interno: se
// ejecuta después de una edición de un administrador (ya autorizada) o desde el script de reconstrucción,
// nunca desde la petición de un visitante.
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
