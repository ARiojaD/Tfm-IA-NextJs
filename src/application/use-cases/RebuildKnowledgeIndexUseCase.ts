import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import type { RefreshTopicIndexUseCase } from "./RefreshTopicIndexUseCase";

export interface KnowledgeIndexRebuild {
  indexedTopics: number;
  removedTopics: number;
  chunks: number;
}

// Rebuilds the whole RAG index (npm run rag:index): after loading the seed, after changing the embedding
// model, or if an automatic refresh failed. Deleted topics need nothing: their fragments go with them
// (foreign key in PostgreSQL).
export class RebuildKnowledgeIndexUseCase {
  constructor(
    private readonly dependencies: {
      topicEditor: TopicEditorRepository;
      refresh: Pick<RefreshTopicIndexUseCase, "execute">;
    },
  ) {}

  async execute(): Promise<KnowledgeIndexRebuild> {
    const summary: KnowledgeIndexRebuild = { indexedTopics: 0, removedTopics: 0, chunks: 0 };

    // One topic at a time: the embedding model runs on this machine, in parallel it would only compete.
    for (const topic of await this.dependencies.topicEditor.listAll()) {
      const { indexed, chunks } = await this.dependencies.refresh.execute(topic.id);
      if (indexed) summary.indexedTopics++;
      else summary.removedTopics++;
      summary.chunks += chunks;
    }
    return summary;
  }
}
