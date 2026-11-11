import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Result } from "@/shared/Result";
import { UpdateTopicBasicsInputSchema } from "../dto/TopicEditorInputs";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// Título, civilización, categoría, resumen y periodo. El slug no cambia: la URL de un tema nunca cambia.
export class UpdateTopicBasicsUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    return editTopic(this.dependencies, UpdateTopicBasicsInputSchema, input, (topic, { basics }) => ({
      ...topic,
      ...basics,
    }));
  }
}
