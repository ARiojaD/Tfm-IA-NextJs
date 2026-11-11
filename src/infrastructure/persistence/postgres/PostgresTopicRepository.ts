import { and, eq, inArray, or } from "drizzle-orm";
import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";
import type { Database } from "./client";
import { toTopic, toTopicRow } from "./mappers";
import { topicRelations, topics } from "./schema";

// Los métodos públicos filtran por estado en el SQL, así que un borrador ni siquiera sale de la base de
// datos hacia una página pública.
const isPublished = eq(topics.status, "PUBLISHED");

// Un solo repositorio para los dos ports: la cara pública y el editor del panel.
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

  // Inserta o actualiza la fila propia del tema; `topic_relations` no se toca.
  async save(topic: HistoricalTopic): Promise<void> {
    const { id, ...fields } = toTopicRow(topic);
    await this.db
      .insert(topics)
      .values({ id, ...fields })
      .onConflictDoUpdate({ target: topics.id, set: fields });
  }

  // Sus eventos, quiz, comentarios, recomendaciones, relaciones y entradas de biblioteca se van con él (en
  // cascada).
  async delete(id: EntityId): Promise<void> {
    await this.db.delete(topics).where(eq(topics.id, id));
  }

  // Los dos sentidos en una transacción: se borran todas las filas en las que aparece el tema y cada par
  // vuelve dos veces (A → B y B → A).
  async setRelatedTopics(topicId: EntityId, relatedTopicIds: EntityId[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(topicRelations)
        .where(or(eq(topicRelations.topicId, topicId), eq(topicRelations.relatedTopicId, topicId)));
      if (relatedTopicIds.length > 0) {
        await tx.insert(topicRelations).values(
          relatedTopicIds.flatMap((relatedTopicId) => [
            { topicId, relatedTopicId },
            { topicId: relatedTopicId, relatedTopicId: topicId },
          ]),
        );
      }
    });
  }

  // Una sola consulta más para todas las relaciones de los temas cargados (no una por tema). Ordenadas por
  // id para que un tema vuelva siempre igual: sin ORDER BY, PostgreSQL no garantiza ningún orden.
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
      )
      .orderBy(topicRelations.relatedTopicId);

    return rows.map((row) =>
      toTopic(
        row,
        relations.filter((relation) => relation.topicId === row.id).map((relation) => relation.relatedTopicId),
      ),
    );
  }
}
