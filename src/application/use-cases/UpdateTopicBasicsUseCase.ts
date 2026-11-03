import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Result } from "@/shared/Result";
import { UpdateTopicBasicsInputSchema } from "../dto/TopicEditorInputs";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// Title, civilization, category, summary and period. The slug stays: the URL of a topic never changes.
export class UpdateTopicBasicsUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    return editTopic(this.dependencies, UpdateTopicBasicsInputSchema, input, (topic, { basics }) => ({
      ...topic,
      ...basics,
    }));
  }
}
