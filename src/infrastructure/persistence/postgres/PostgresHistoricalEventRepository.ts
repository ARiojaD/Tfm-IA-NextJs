import { eq } from "drizzle-orm";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toEvent, toEventRow } from "./mappers";
import { historicalEvents } from "./schema";

// Los eventos de la cronología en PostgreSQL. El orden por fecha lo pone el caso de uso.
export class PostgresHistoricalEventRepository implements HistoricalEventRepository {
  constructor(private readonly db: Database) {}

  async listByTopic(topicId: EntityId): Promise<HistoricalEvent[]> {
    const rows = await this.db.select().from(historicalEvents).where(eq(historicalEvents.topicId, topicId));
    return rows.map(toEvent);
  }

  // En una transacción: la cronología nunca se queda sustituida a medias.
  async replaceForTopic(topicId: EntityId, events: HistoricalEvent[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(historicalEvents).where(eq(historicalEvents.topicId, topicId));
      if (events.length > 0) {
        await tx.insert(historicalEvents).values(events.map(toEventRow));
      }
    });
  }
}
