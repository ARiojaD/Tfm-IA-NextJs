import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";

export class InMemoryHistoricalEventRepository implements HistoricalEventRepository {
  private readonly events: HistoricalEvent[];

  constructor(events: HistoricalEvent[] = []) {
    this.events = structuredClone(events);
  }

  async listByTopic(topicId: EntityId): Promise<HistoricalEvent[]> {
    return structuredClone(this.events.filter((event) => event.topicId === topicId));
  }
}
