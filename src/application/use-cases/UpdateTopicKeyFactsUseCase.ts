import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Result } from "@/shared/Result";
import { UpdateTopicKeyFactsInputSchema } from "../dto/TopicEditorInputs";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// The fact sheet: label/value pairs in the order the admin wrote them. The whole list is replaced.
export class UpdateTopicKeyFactsUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    return editTopic(this.dependencies, UpdateTopicKeyFactsInputSchema, input, (topic, { keyFacts }) => ({
      ...topic,
      keyFacts,
    }));
  }
}
