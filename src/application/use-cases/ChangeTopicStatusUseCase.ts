import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { failure, type Result } from "@/shared/Result";
import { ChangeTopicStatusInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// Publicar (el tema aparece en la web) o despublicar (vuelve a borrador: oculto, pero no se pierde nada).
// Publicar un tema incompleto falla con la lista de lo que falta, sacada de las reglas del dominio.
export class ChangeTopicStatusUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  async execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    const result = await editTopic(this.dependencies, ChangeTopicStatusInputSchema, input, (topic, { status }) => ({
      ...topic,
      status,
    }));

    // Se muestra junto al botón "Publicar", no junto a los campos de otras secciones.
    if (!result.success && result.error instanceof InvalidTopicError) {
      const { fieldErrors, formErrors } = result.error;
      return failure(new InvalidTopicError({}, [...formErrors, ...Object.values(fieldErrors).flat()]));
    }
    return result;
  }
}
