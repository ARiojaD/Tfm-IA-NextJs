import type { Recommendation } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface RecommendationRepository {
  listByTopic(topicId: EntityId): Promise<Recommendation[]>;
}
