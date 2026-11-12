import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// Los hitos en memoria, para los tests unitarios y el container en memoria.
export class InMemoryTimelineMilestoneRepository implements TimelineMilestoneRepository {
  private milestones: TimelineMilestone[];

  constructor(milestones: TimelineMilestone[] = []) {
    this.milestones = structuredClone(milestones);
  }

  listByEra(era: HistoricalEra): Promise<TimelineMilestone[]> {
    return Promise.resolve(structuredClone(this.milestones.filter((milestone) => milestone.era === era)));
  }

  replaceForEra(era: HistoricalEra, milestones: TimelineMilestone[]): Promise<void> {
    this.milestones = [...this.milestones.filter((milestone) => milestone.era !== era), ...structuredClone(milestones)];
    return Promise.resolve();
  }
}
