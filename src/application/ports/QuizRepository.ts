import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface QuizRepository {
  findByTopic(topicId: EntityId): Promise<Quiz | null>;
}
