import type { Recommendation } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface RecommendationRepository {
  listByTopic(topicId: EntityId): Promise<Recommendation[]>;
  // The admin editor saves a topic's recommendations as a whole list: what is not in it is deleted.
  replaceForTopic(topicId: EntityId, recommendations: Recommendation[]): Promise<void>;
}
