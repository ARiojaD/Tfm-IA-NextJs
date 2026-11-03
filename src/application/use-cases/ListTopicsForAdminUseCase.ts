import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { success, type Result } from "@/shared/Result";
import type { TopicRepository } from "../ports/TopicRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

export interface AdminEraTopics {
  era: HistoricalEra;
  topics: HistoricalTopic[];
}

// The panel's list of topics: every civilization (also the empty ones, where new topics will go), each
// with its topics in time order.
export class ListTopicsForAdminUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies & { topics: TopicRepository }) {}

  async execute(): Promise<Result<AdminEraTopics[], AdminAuthorizationError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const eras = await Promise.all(
      HISTORICAL_ERAS.map(async (era) => ({
        era,
        topics: (await this.dependencies.topics.listByEra(era)).toSorted(compareTopicsChronologically),
      })),
    );
    return success(eras);
  }
}
