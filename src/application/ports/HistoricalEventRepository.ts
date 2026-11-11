import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Los eventos de la cronología de cada tema.
export interface HistoricalEventRepository {
  listByTopic(topicId: EntityId): Promise<HistoricalEvent[]>;
  // El editor del panel guarda la cronología de un tema como una lista completa: lo que no está en ella se
  // borra. Los eventos de otros temas nunca se tocan.
  replaceForTopic(topicId: EntityId, events: HistoricalEvent[]): Promise<void>;
}
