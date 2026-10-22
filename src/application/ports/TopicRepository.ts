import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";

export interface TopicRepository {
  findBySlug(slug: Slug): Promise<HistoricalTopic | null>;
  listByEra(era: HistoricalEra): Promise<HistoricalTopic[]>;
}
