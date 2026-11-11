import type { Recommendation } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Los libros, películas y series recomendados en cada tema.
export interface RecommendationRepository {
  listByTopic(topicId: EntityId): Promise<Recommendation[]>;
  // El editor del panel guarda las recomendaciones de un tema como una lista completa: lo que no está en
  // ella se borra.
  replaceForTopic(topicId: EntityId, recommendations: Recommendation[]): Promise<void>;
}
