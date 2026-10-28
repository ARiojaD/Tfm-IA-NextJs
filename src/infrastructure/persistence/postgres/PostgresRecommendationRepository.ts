import { eq } from "drizzle-orm";
import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { Recommendation } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toRecommendation } from "./mappers";
import { recommendations } from "./schema";

export class PostgresRecommendationRepository implements RecommendationRepository {
  constructor(private readonly db: Database) {}

  async listByTopic(topicId: EntityId): Promise<Recommendation[]> {
    const rows = await this.db.select().from(recommendations).where(eq(recommendations.topicId, topicId));
    return rows.map(toRecommendation);
  }
}
