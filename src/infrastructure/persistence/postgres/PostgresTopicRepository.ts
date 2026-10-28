import { eq, inArray } from "drizzle-orm";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";
import type { Database } from "./client";
import { toTopic } from "./mappers";
import { topicRelations, topics } from "./schema";

export class PostgresTopicRepository implements TopicRepository {
  constructor(private readonly db: Database) {}

  async findBySlug(slug: Slug): Promise<HistoricalTopic | null> {
    const rows = await this.db.select().from(topics).where(eq(topics.slug, slug)).limit(1);
    const [topic] = await this.withRelatedTopicIds(rows);
    return topic ?? null;
  }

  async listByEra(era: HistoricalEra): Promise<HistoricalTopic[]> {
    const rows = await this.db.select().from(topics).where(eq(topics.era, era));
    return this.withRelatedTopicIds(rows);
  }

  async findByIds(ids: EntityId[]): Promise<HistoricalTopic[]> {
    if (ids.length === 0) return [];
    const rows = await this.db.select().from(topics).where(inArray(topics.id, ids));
    return this.withRelatedTopicIds(rows);
  }

  // One extra query for all the relations of the loaded topics (not one per topic).
  private async withRelatedTopicIds(rows: (typeof topics.$inferSelect)[]): Promise<HistoricalTopic[]> {
    if (rows.length === 0) return [];
    const relations = await this.db
      .select()
      .from(topicRelations)
      .where(
        inArray(
          topicRelations.topicId,
          rows.map((row) => row.id),
        ),
      );

    return rows.map((row) =>
      toTopic(
        row,
        relations.filter((relation) => relation.topicId === row.id).map((relation) => relation.relatedTopicId),
      ),
    );
  }
}
