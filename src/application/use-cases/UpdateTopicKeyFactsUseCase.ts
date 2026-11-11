import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Result } from "@/shared/Result";
import { UpdateTopicKeyFactsInputSchema } from "../dto/TopicEditorInputs";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// La ficha: pares etiqueta/valor en el orden en que los escribió el administrador. Se sustituye la lista
// entera.
export class UpdateTopicKeyFactsUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    return editTopic(this.dependencies, UpdateTopicKeyFactsInputSchema, input, (topic, { keyFacts }) => ({
      ...topic,
      keyFacts,
    }));
  }
}
