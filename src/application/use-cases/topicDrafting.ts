import { topicSourceText } from "@/domain/entities/TopicDrafts";
import { failure, success, type Result } from "@/shared/Result";
import { DraftTopicInputSchema } from "../dto/TopicEditorInputs";
import { TopicDraftError } from "../errors/TopicDraftError";
import type { ContentDrafter, TopicSource } from "../ports/ContentDrafter";
import { loadTopicToEdit, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

export interface TopicDraftingDependencies extends TopicEditingDependencies {
  drafter: ContentDrafter;
}

export type TopicDraftingError = TopicEditingError | TopicDraftError;

// Los pasos que comparten las dos propuestas de la IA: las comprobaciones habituales de administración y
// luego el modelo sobre el texto guardado del tema. De la petición solo llega el id del tema, así que el
// modelo nunca lee un texto elegido por quien llama. No se guarda nada: las filas van al formulario para
// que las revise el administrador.
export async function draftFromTopic<Generated, Row>(
  dependencies: TopicDraftingDependencies,
  input: unknown,
  generate: (source: TopicSource) => Promise<Generated>,
  toRows: (generated: Generated, sourceText: string) => Row[],
): Promise<Result<Row[], TopicDraftingError>> {
  const loaded = await loadTopicToEdit(dependencies, DraftTopicInputSchema, input);
  if (!loaded.success) return loaded;

  const { topic } = loaded.data;
  const text = topicSourceText(topic);
  if (!text) {
    return failure(new TopicDraftError("NO_TEXT"));
  }

  let generated: Generated;
  try {
    generated = await generate({ title: topic.title, text });
  } catch {
    return failure(new TopicDraftError("UNAVAILABLE"));
  }

  const rows = toRows(generated, text);
  return rows.length > 0 ? success(rows) : failure(new TopicDraftError("EMPTY"));
}
