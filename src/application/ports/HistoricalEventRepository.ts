import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface HistoricalEventRepository {
  listByTopic(topicId: EntityId): Promise<HistoricalEvent[]>;
  // The admin editor saves a topic's timeline as a whole list: what is not in it is deleted. Other
  // topics' events are never touched.
  replaceForTopic(topicId: EntityId, events: HistoricalEvent[]): Promise<void>;
}
