import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";

export class InMemoryHistoricalEventRepository implements HistoricalEventRepository {
  private events: HistoricalEvent[];

  constructor(events: HistoricalEvent[] = []) {
    this.events = structuredClone(events);
  }

  listByTopic(topicId: EntityId): Promise<HistoricalEvent[]> {
    return Promise.resolve(structuredClone(this.events.filter((event) => event.topicId === topicId)));
  }

  replaceForTopic(topicId: EntityId, events: HistoricalEvent[]): Promise<void> {
    this.events = [...this.events.filter((event) => event.topicId !== topicId), ...structuredClone(events)];
    return Promise.resolve();
  }
}
