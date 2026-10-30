import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// "Mi biblioteca": the civilizations a user follows (every topic of that era, including future ones) and
// the topics they save one by one. Every method is scoped to one user: nobody reads or changes another
// user's library (OWASP A01/BOLA). Following or saving twice changes nothing (idempotent).
export interface LibraryRepository {
  followEra(userId: EntityId, era: HistoricalEra): Promise<void>;
  unfollowEra(userId: EntityId, era: HistoricalEra): Promise<void>;
  // The order of the result is not guaranteed.
  listFollowedEras(userId: EntityId): Promise<HistoricalEra[]>;
  // Saving an already saved topic keeps its original date.
  saveTopic(userId: EntityId, topicId: EntityId, savedAt: Date): Promise<void>;
  removeSavedTopic(userId: EntityId, topicId: EntityId): Promise<void>;
  // Most recently saved first.
  listSavedTopicIds(userId: EntityId): Promise<EntityId[]>;
}
