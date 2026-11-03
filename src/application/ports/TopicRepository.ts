import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";

// The public side of the topics: every method sees only PUBLISHED topics, so a draft is invisible
// everywhere (civilization pages, topic pages, related topics, libraries, comments) without each page
// having to remember it. The admin panel uses TopicEditorRepository instead.
export interface TopicRepository {
  findBySlug(slug: Slug): Promise<HistoricalTopic | null>;
  listByEra(era: HistoricalEra): Promise<HistoricalTopic[]>;
  // Unknown ids are skipped; the order of the result is not guaranteed.
  findByIds(ids: EntityId[]): Promise<HistoricalTopic[]>;
}
