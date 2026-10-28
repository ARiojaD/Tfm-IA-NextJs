import { eq } from "drizzle-orm";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toEvent } from "./mappers";
import { historicalEvents } from "./schema";

export class PostgresHistoricalEventRepository implements HistoricalEventRepository {
  constructor(private readonly db: Database) {}

  async listByTopic(topicId: EntityId): Promise<HistoricalEvent[]> {
    const rows = await this.db.select().from(historicalEvents).where(eq(historicalEvents.topicId, topicId));
    return rows.map(toEvent);
  }
}
