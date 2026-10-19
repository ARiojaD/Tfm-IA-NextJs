import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface HistoricalEventRepository {
  listByTopic(topicId: EntityId): Promise<HistoricalEvent[]>;
}
