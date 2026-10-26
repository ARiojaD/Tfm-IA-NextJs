import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { Recommendation } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";

export class InMemoryRecommendationRepository implements RecommendationRepository {
  private readonly recommendations: Recommendation[];

  constructor(recommendations: Recommendation[] = []) {
    this.recommendations = structuredClone(recommendations);
  }

  listByTopic(topicId: EntityId): Promise<Recommendation[]> {
    return Promise.resolve(
      structuredClone(this.recommendations.filter((recommendation) => recommendation.topicId === topicId)),
    );
  }
}
