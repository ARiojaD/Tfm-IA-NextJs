import { and, desc, eq } from "drizzle-orm";
import type { LibraryRepository } from "@/application/ports/LibraryRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Database } from "./client";
import { toFollowedEra, toSavedTopicId } from "./mappers";
import { eraFollows, savedTopics } from "./schema";

// Every query filters by user_id: one user's library is never read or changed through another's.
export class PostgresLibraryRepository implements LibraryRepository {
  constructor(private readonly db: Database) {}

  // ON CONFLICT DO NOTHING: following again is not an error and keeps the original row.
  async followEra(userId: EntityId, era: HistoricalEra): Promise<void> {
    await this.db.insert(eraFollows).values({ userId, era }).onConflictDoNothing();
  }

  async unfollowEra(userId: EntityId, era: HistoricalEra): Promise<void> {
    await this.db.delete(eraFollows).where(and(eq(eraFollows.userId, userId), eq(eraFollows.era, era)));
  }

  async listFollowedEras(userId: EntityId): Promise<HistoricalEra[]> {
    const rows = await this.db.select({ era: eraFollows.era }).from(eraFollows).where(eq(eraFollows.userId, userId));
    return rows.map(toFollowedEra);
  }

  async saveTopic(userId: EntityId, topicId: EntityId, savedAt: Date): Promise<void> {
    await this.db.insert(savedTopics).values({ userId, topicId, savedAt }).onConflictDoNothing();
  }

  async removeSavedTopic(userId: EntityId, topicId: EntityId): Promise<void> {
    await this.db.delete(savedTopics).where(and(eq(savedTopics.userId, userId), eq(savedTopics.topicId, topicId)));
  }

  async listSavedTopicIds(userId: EntityId): Promise<EntityId[]> {
    const rows = await this.db
      .select({ topicId: savedTopics.topicId })
      .from(savedTopics)
      .where(eq(savedTopics.userId, userId))
      .orderBy(desc(savedTopics.savedAt));
    return rows.map(toSavedTopicId);
  }
}
