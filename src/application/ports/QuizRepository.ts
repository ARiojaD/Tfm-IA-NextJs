import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface QuizRepository {
  findByTopic(topicId: EntityId): Promise<Quiz | null>;
  // The admin editor saves a topic's quiz as a whole (questions in order); null removes it.
  replaceForTopic(topicId: EntityId, quiz: Quiz | null): Promise<void>;
}
