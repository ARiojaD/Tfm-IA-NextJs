import { eq } from "drizzle-orm";
import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Database } from "./client";
import { toMilestone, toMilestoneRow } from "./mappers";
import { timelineMilestones } from "./schema";

// Los hitos de la cronología de cada civilización en PostgreSQL. El orden por fecha lo pone el caso de uso.
export class PostgresTimelineMilestoneRepository implements TimelineMilestoneRepository {
  constructor(private readonly db: Database) {}

  async listByEra(era: HistoricalEra): Promise<TimelineMilestone[]> {
    const rows = await this.db.select().from(timelineMilestones).where(eq(timelineMilestones.era, era));
    return rows.map(toMilestone);
  }

  // En una transacción: la cronología nunca se queda sustituida a medias.
  async replaceForEra(era: HistoricalEra, milestones: TimelineMilestone[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(timelineMilestones).where(eq(timelineMilestones.era, era));
      if (milestones.length > 0) {
        await tx.insert(timelineMilestones).values(milestones.map(toMilestoneRow));
      }
    });
  }
}
