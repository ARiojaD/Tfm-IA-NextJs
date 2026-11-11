import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Result } from "@/shared/Result";
import { UpdateTopicIntroductionInputSchema } from "../dto/TopicEditorInputs";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// El texto principal del tema (el que indexa el RAG), escrito en párrafos separados por líneas en blanco.
export class UpdateTopicIntroductionUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    return editTopic(this.dependencies, UpdateTopicIntroductionInputSchema, input, (topic, { introduction }) => ({
      ...topic,
      introduction,
    }));
  }
}
