import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Result } from "@/shared/Result";
import { UpdateTopicIntroductionInputSchema } from "../dto/TopicEditorInputs";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// The topic's main text (the one the RAG will index), written as paragraphs separated by blank lines.
export class UpdateTopicIntroductionUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    return editTopic(this.dependencies, UpdateTopicIntroductionInputSchema, input, (topic, { introduction }) => ({
      ...topic,
      introduction,
    }));
  }
}
