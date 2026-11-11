import type { z } from "zod";
import { type HistoricalTopic, HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { type Slug, slugify } from "@/domain/value-objects/Slug";
import { failure, success, type Result } from "@/shared/Result";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminWriteDependencies, type AdminWriteError, authorizeAdminWrite } from "./authorizeAdmin";

// Los pasos que comparten todos los casos de uso del editor de temas.

export interface TopicEditingDependencies extends AdminWriteDependencies {
  topicEditor: TopicEditorRepository;
}

export type TopicEditingError = AdminWriteError | InvalidTopicError | TopicNotFoundError;

// El tema entero pasa por el esquema del dominio antes de guardarse, así ninguna edición puede dejarlo en
// un estado que la web no sepa mostrar (por ejemplo, un tema publicado sin introducción).
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

// Los primeros pasos de todo cambio: administrador, límite de peticiones, entrada y el tema al que se
// refiere. En ese orden.
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

// Un cambio en los campos propios del tema: se carga, se cambia, se comprueba con las reglas del dominio y
// se guarda.
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

// Una lista del tema (eventos, recomendaciones…) comprobada con su esquema del dominio antes de guardarla.
// Los errores van bajo el campo de la lista, nombrando la fila ("Evento 2: …").
export function validateTopicList<Item>(
  schema: z.ZodType<Item>,
  rows: unknown[],
  field: string,
): Result<Item[], InvalidTopicError> {
  const parsed = schema.array().safeParse(rows);
  return parsed.success ? success(parsed.data) : failure(InvalidTopicError.fromIssues(parsed.error.issues, [field]));
}

// Conserva el id de una fila solo si ya pertenecía a este tema; cualquier otro recibe un id nuevo. Así,
// una petición que envía el id de una fila de otro tema crea una fila nueva en lugar de sobrescribir
// aquella (OWASP BOLA).
export function keepOwnId(ownIds: Set<EntityId>, ids: { generate(): EntityId }) {
  return (id: string | undefined): EntityId => (id !== undefined && ownIds.has(id) ? id : ids.generate());
}

// "viriato" y, si ya existe, "viriato-2", "viriato-3"… Los slugs son únicos entre borradores y temas
// publicados.
export async function uniqueSlug(topicEditor: TopicEditorRepository, title: string): Promise<Slug> {
  const base = slugify(title);
  let candidate = base;
  for (let suffix = 2; await topicEditor.slugExists(candidate); suffix++) {
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}
