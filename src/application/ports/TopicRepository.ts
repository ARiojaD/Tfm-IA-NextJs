import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";

// La cara pública de los temas: todos los métodos ven solo temas publicados, así que un borrador es
// invisible en todas partes (páginas de civilización y de tema, relacionados, bibliotecas, comentarios)
// sin que cada página tenga que acordarse. El panel de administración usa `TopicEditorRepository`.
export interface TopicRepository {
  findBySlug(slug: Slug): Promise<HistoricalTopic | null>;
  listByEra(era: HistoricalEra): Promise<HistoricalTopic[]>;
  // Los ids desconocidos se omiten; el orden del resultado no está garantizado.
  findByIds(ids: EntityId[]): Promise<HistoricalTopic[]>;
}
