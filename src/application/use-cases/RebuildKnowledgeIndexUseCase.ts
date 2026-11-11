import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import type { RefreshTopicIndexUseCase } from "./RefreshTopicIndexUseCase";

export interface KnowledgeIndexRebuild {
  indexedTopics: number;
  removedTopics: number;
  chunks: number;
}

// Reconstruye entero el índice del RAG (`npm run rag:index`): después de cargar el seed, después de
// cambiar el modelo de embeddings o si falló una actualización automática. Los temas borrados no necesitan
// nada: sus fragmentos se van con ellos (clave foránea en PostgreSQL).
export class RebuildKnowledgeIndexUseCase {
  constructor(
    private readonly dependencies: {
      topicEditor: TopicEditorRepository;
      refresh: Pick<RefreshTopicIndexUseCase, "execute">;
    },
  ) {}

  async execute(): Promise<KnowledgeIndexRebuild> {
    const summary: KnowledgeIndexRebuild = { indexedTopics: 0, removedTopics: 0, chunks: 0 };

    // Un tema cada vez: el modelo de embeddings se ejecuta en esta máquina y en paralelo solo competiría
    // consigo mismo.
    for (const topic of await this.dependencies.topicEditor.listAll()) {
      const { indexed, chunks } = await this.dependencies.refresh.execute(topic.id);
      if (indexed) summary.indexedTopics++;
      else summary.removedTopics++;
      summary.chunks += chunks;
    }
    return summary;
  }
}
