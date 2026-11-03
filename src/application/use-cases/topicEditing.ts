import type { z } from "zod";
import { type HistoricalTopic, HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { type Slug, slugify } from "@/domain/value-objects/Slug";
import { failure, success, type Result } from "@/shared/Result";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminWriteDependencies, type AdminWriteError, authorizeAdminWrite } from "./authorizeAdmin";

// The steps every topic editor use case shares.

export interface TopicEditingDependencies extends AdminWriteDependencies {
  topicEditor: TopicEditorRepository;
}

export type TopicEditingError = AdminWriteError | InvalidTopicError | TopicNotFoundError;

// The whole topic goes through the domain schema before saving, so no edit can leave it in a state the
// web cannot show (e.g. a published topic without introduction).
export async function saveValidTopic(
  topicEditor: TopicEditorRepository,
  topic: HistoricalTopic,
): Promise<Result<HistoricalTopic, InvalidTopicError>> {
  const parsed = HistoricalTopicSchema.safeParse(topic);
  if (!parsed.success) {
    return failure(InvalidTopicError.fromIssues(parsed.error.issues));
  }
  await topicEditor.save(parsed.data);
  return success(parsed.data);
}

// The first steps of every change: admin, rate limit, input, and the topic it is about. In that order.
export async function loadTopicToEdit<Schema extends z.ZodType<{ topicId: EntityId }>>(
  dependencies: TopicEditingDependencies,
  schema: Schema,
  input: unknown,
): Promise<Result<{ topic: HistoricalTopic; data: z.output<Schema> }, TopicEditingError>> {
  const access = await authorizeAdminWrite(dependencies);
  if (!access.success) return access;

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return failure(InvalidTopicError.fromIssues(parsed.error.issues));
  }

  const topic = await dependencies.topicEditor.findById(parsed.data.topicId);
  if (!topic) {
    return failure(new TopicNotFoundError(parsed.data.topicId));
  }
  return success({ topic, data: parsed.data });
}

// A change to the topic's own fields: loaded, changed, checked against the domain rules and saved.
export async function editTopic<Schema extends z.ZodType<{ topicId: EntityId }>>(
  dependencies: TopicEditingDependencies,
  schema: Schema,
  input: unknown,
  applyChange: (topic: HistoricalTopic, data: z.output<Schema>) => HistoricalTopic,
): Promise<Result<HistoricalTopic, TopicEditingError>> {
  const loaded = await loadTopicToEdit(dependencies, schema, input);
  if (!loaded.success) return loaded;
  return saveValidTopic(dependencies.topicEditor, applyChange(loaded.data.topic, loaded.data.data));
}

// A list of the topic (events, recommendations…) checked with its domain schema before saving. The
// errors go under the list's field, naming the row ("Evento 2: …").
export function validateTopicList<Item>(
  schema: z.ZodType<Item>,
  rows: unknown[],
  field: string,
): Result<Item[], InvalidTopicError> {
  const parsed = schema.array().safeParse(rows);
  return parsed.success ? success(parsed.data) : failure(InvalidTopicError.fromIssues(parsed.error.issues, [field]));
}

// Keeps a row's id only if it already belonged to this topic; anything else gets a new id. So a request
// that sends the id of another topic's row creates a new row instead of overwriting that one.
export function keepOwnId(ownIds: Set<EntityId>, ids: { generate(): EntityId }) {
  return (id: string | undefined): EntityId => (id !== undefined && ownIds.has(id) ? id : ids.generate());
}

// "viriato", and if taken "viriato-2", "viriato-3"… Slugs are unique across drafts and published topics.
export async function uniqueSlug(topicEditor: TopicEditorRepository, title: string): Promise<Slug> {
  const base = slugify(title);
  let candidate = base;
  for (let suffix = 2; await topicEditor.slugExists(candidate); suffix++) {
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}
