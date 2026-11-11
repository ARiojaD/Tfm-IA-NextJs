import type { EntityId } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { UpdateRelatedTopicsInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import { loadTopicToEdit, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// "Sigue explorando": los temas relacionados con este, en los dos sentidos. Se pueden elegir borradores;
// la página pública solo muestra los publicados.
export class UpdateRelatedTopicsUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  async execute(input: unknown): Promise<Result<EntityId[], TopicEditingError>> {
    const loaded = await loadTopicToEdit(this.dependencies, UpdateRelatedTopicsInputSchema, input);
    if (!loaded.success) return loaded;

    const { topic, data } = loaded.data;
    const { topicEditor } = this.dependencies;
    if (data.relatedTopicIds.includes(topic.id)) {
      return failure(new InvalidTopicError({ relatedTopicIds: ["Un tema no puede estar relacionado consigo mismo"] }));
    }
    const related = await Promise.all(data.relatedTopicIds.map((id) => topicEditor.findById(id)));
    if (related.some((candidate) => candidate === null)) {
      return failure(new InvalidTopicError({ relatedTopicIds: ["Alguno de los temas elegidos ya no existe"] }));
    }

    await topicEditor.setRelatedTopics(topic.id, data.relatedTopicIds);
    return success(data.relatedTopicIds);
  }
}
