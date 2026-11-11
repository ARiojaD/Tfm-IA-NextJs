import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// "Mi biblioteca": las civilizaciones que sigue un usuario (todos los temas de esa era, también los
// futuros) y los temas que guarda uno a uno. Cada método trabaja sobre un solo usuario: nadie lee ni
// cambia la biblioteca de otro (OWASP A01/BOLA). Seguir o guardar dos veces no cambia nada (idempotente).
export interface LibraryRepository {
  followEra(userId: EntityId, era: HistoricalEra): Promise<void>;
  unfollowEra(userId: EntityId, era: HistoricalEra): Promise<void>;
  // El orden del resultado no está garantizado.
  listFollowedEras(userId: EntityId): Promise<HistoricalEra[]>;
  // Guardar un tema que ya estaba guardado conserva su fecha original.
  saveTopic(userId: EntityId, topicId: EntityId, savedAt: Date): Promise<void>;
  removeSavedTopic(userId: EntityId, topicId: EntityId): Promise<void>;
  // Los guardados más recientemente, primero.
  listSavedTopicIds(userId: EntityId): Promise<EntityId[]>;
}
