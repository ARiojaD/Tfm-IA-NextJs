import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { success, type Result } from "@/shared/Result";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

export interface AdminEraTopics {
  era: HistoricalEra;
  topics: HistoricalTopic[];
}

// La lista de temas del panel, también los borradores: todas las civilizaciones (también las vacías, donde
// irán los temas nuevos), cada una con sus temas en orden cronológico.
export class ListTopicsForAdminUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies & { topicEditor: TopicEditorRepository }) {}

  async execute(): Promise<Result<AdminEraTopics[], AdminAuthorizationError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const topics = (await this.dependencies.topicEditor.listAll()).toSorted(compareTopicsChronologically);
    return success(HISTORICAL_ERAS.map((era) => ({ era, topics: topics.filter((topic) => topic.era === era) })));
  }
}
