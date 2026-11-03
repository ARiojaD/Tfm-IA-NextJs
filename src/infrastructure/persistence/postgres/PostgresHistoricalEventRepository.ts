import { eq } from "drizzle-orm";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toEvent, toEventRow } from "./mappers";
import { historicalEvents } from "./schema";

export class PostgresHistoricalEventRepository implements HistoricalEventRepository {
  constructor(private readonly db: Database) {}

  async listByTopic(topicId: EntityId): Promise<HistoricalEvent[]> {
    const rows = await this.db.select().from(historicalEvents).where(eq(historicalEvents.topicId, topicId));
    return rows.map(toEvent);
  }

  // In one transaction: the timeline is never left half replaced.
  async replaceForTopic(topicId: EntityId, events: HistoricalEvent[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(historicalEvents).where(eq(historicalEvents.topicId, topicId));
      if (events.length > 0) {
        await tx.insert(historicalEvents).values(events.map(toEventRow));
      }
    });
  }
}
