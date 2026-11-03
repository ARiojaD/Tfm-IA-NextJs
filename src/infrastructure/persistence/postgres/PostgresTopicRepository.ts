import { and, eq, inArray } from "drizzle-orm";
import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";
import type { Database } from "./client";
import { toTopic, toTopicRow } from "./mappers";
import { topicRelations, topics } from "./schema";

// The public methods filter by status in SQL, so a draft never even leaves the database for a public page.
const isPublished = eq(topics.status, "PUBLISHED");

export class PostgresTopicRepository implements TopicRepository, TopicEditorRepository {
  constructor(private readonly db: Database) {}

  async findBySlug(slug: Slug): Promise<HistoricalTopic | null> {
    const rows = await this.db.select().from(topics).where(and(eq(topics.slug, slug), isPublished)).limit(1);
    const [topic] = await this.withRelatedTopicIds(rows);
    return topic ?? null;
  }

  async listByEra(era: HistoricalEra): Promise<HistoricalTopic[]> {
    const rows = await this.db.select().from(topics).where(and(eq(topics.era, era), isPublished));
    return this.withRelatedTopicIds(rows);
  }

  async findByIds(ids: EntityId[]): Promise<HistoricalTopic[]> {
    if (ids.length === 0) return [];
    const rows = await this.db.select().from(topics).where(and(inArray(topics.id, ids), isPublished));
    return this.withRelatedTopicIds(rows);
  }

  async findById(id: EntityId): Promise<HistoricalTopic | null> {
    const rows = await this.db.select().from(topics).where(eq(topics.id, id)).limit(1);
    const [topic] = await this.withRelatedTopicIds(rows);
    return topic ?? null;
  }

  async listAll(): Promise<HistoricalTopic[]> {
    return this.withRelatedTopicIds(await this.db.select().from(topics));
  }

  async slugExists(slug: Slug): Promise<boolean> {
    const rows = await this.db.select({ id: topics.id }).from(topics).where(eq(topics.slug, slug)).limit(1);
    return rows.length > 0;
  }

  // Insert or update the topic's own row; topic_relations is not touched.
  async save(topic: HistoricalTopic): Promise<void> {
    const { id, ...fields } = toTopicRow(topic);
    await this.db
      .insert(topics)
      .values({ id, ...fields })
      .onConflictDoUpdate({ target: topics.id, set: fields });
  }

  // Its events, quiz, comments, recommendations, relations and library entries go with it (cascade).
  async delete(id: EntityId): Promise<void> {
    await this.db.delete(topics).where(eq(topics.id, id));
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
