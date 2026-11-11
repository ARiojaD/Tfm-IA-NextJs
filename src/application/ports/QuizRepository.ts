import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";

// El quiz de cada tema, con sus respuestas correctas: solo lo leen los casos de uso del servidor.
export interface QuizRepository {
  findByTopic(topicId: EntityId): Promise<Quiz | null>;
  // El editor del panel guarda el quiz de un tema entero (las preguntas en orden); null lo elimina.
  replaceForTopic(topicId: EntityId, quiz: Quiz | null): Promise<void>;
}
