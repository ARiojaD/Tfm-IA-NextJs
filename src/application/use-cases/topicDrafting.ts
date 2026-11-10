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

// The steps both proposals share: the usual admin checks, then the model over the topic's saved text.
// Only the topic's id comes from the request, so the model never reads text chosen by the caller.
// Nothing is saved: the rows go to the form, for the administrator to review.
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
