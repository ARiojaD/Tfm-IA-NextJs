import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { success, type Result } from "@/shared/Result";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

export interface AdminEraTopics {
  era: HistoricalEra;
  topics: HistoricalTopic[];
}

// The panel's list of topics, drafts included: every civilization (also the empty ones, where new topics
// will go), each with its topics in time order.
export class ListTopicsForAdminUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies & { topicEditor: TopicEditorRepository }) {}

  async execute(): Promise<Result<AdminEraTopics[], AdminAuthorizationError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const topics = (await this.dependencies.topicEditor.listAll()).toSorted(compareTopicsChronologically);
    return success(HISTORICAL_ERAS.map((era) => ({ era, topics: topics.filter((topic) => topic.era === era) })));
  }
}
