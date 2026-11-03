import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { Recommendation } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";

export class InMemoryRecommendationRepository implements RecommendationRepository {
  private recommendations: Recommendation[];

  constructor(recommendations: Recommendation[] = []) {
    this.recommendations = structuredClone(recommendations);
  }

  listByTopic(topicId: EntityId): Promise<Recommendation[]> {
    return Promise.resolve(
      structuredClone(this.recommendations.filter((recommendation) => recommendation.topicId === topicId)),
    );
  }

  replaceForTopic(topicId: EntityId, recommendations: Recommendation[]): Promise<void> {
    this.recommendations = [
      ...this.recommendations.filter((recommendation) => recommendation.topicId !== topicId),
      ...structuredClone(recommendations),
    ];
    return Promise.resolve();
  }
}
