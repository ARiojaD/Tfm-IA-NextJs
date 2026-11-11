import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Slug } from "@/domain/value-objects/Slug";

// La vista de los temas que tiene el panel de administración: a diferencia de `TopicRepository` (la
// pública, solo temas publicados), ve también los borradores y escribe. Solo la reciben los casos de uso
// de administración.
export interface TopicEditorRepository {
  // Cualquier estado. Un id desconocido devuelve null.
  findById(id: EntityId): Promise<HistoricalTopic | null>;
  // Todos los temas, también los borradores. El orden no está garantizado.
  listAll(): Promise<HistoricalTopic[]>;
  // Si algún tema (borrador o publicado) ya usa este slug: los slugs son únicos.
  slugExists(slug: Slug): Promise<boolean>;
  // Crea el tema o sustituye sus propios campos. Sus temas relacionados se quedan como están (se
  // gestionan aparte, en los dos sentidos).
  save(topic: HistoricalTopic): Promise<void>;
  delete(id: EntityId): Promise<void>;
  // Las relaciones van en los dos sentidos: relacionar A con B también lista A en B, y quitarla quita las
  // dos. Sustituye la lista entera del tema; los ids deben ser de temas existentes (lo comprueba el caso
  // de uso).
  setRelatedTopics(topicId: EntityId, relatedTopicIds: EntityId[]): Promise<void>;
}
