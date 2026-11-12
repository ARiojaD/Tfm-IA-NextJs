import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// Los hitos de la cronología completa de cada civilización.
export interface TimelineMilestoneRepository {
  // El orden del resultado no está garantizado: la cronología la ordena el caso de uso por fecha.
  listByEra(era: HistoricalEra): Promise<TimelineMilestone[]>;
  // El editor del panel guarda la cronología de una civilización como una lista completa: lo que no está
  // en ella se borra. Los hitos de otras civilizaciones nunca se tocan.
  replaceForEra(era: HistoricalEra, milestones: TimelineMilestone[]): Promise<void>;
}
