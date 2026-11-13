import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import { compareHistoricalDates } from "@/domain/value-objects/HistoricalDate";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { type Result, success } from "@/shared/Result";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// Los temas que ofrece el selector de cada hito: lo justo para elegir uno y saber si es un borrador.
export type MilestoneTopicOption = Pick<HistoricalTopic, "id" | "title" | "status">;

export interface EraTimelineEditorData {
  era: HistoricalEra;
  milestones: TimelineMilestone[];
  topicOptions: MilestoneTopicOption[];
}

// Lo que muestra el editor de la cronología de una civilización: sus hitos por fecha y los temas de esa
// civilización que se pueden enlazar, también los borradores (la página pública los mostrará sin enlace
// hasta que se publiquen). Solo para administradores.
export class GetEraTimelineForEditingUseCase {
  constructor(
    private readonly dependencies: AdminAuthorizationDependencies & {
      milestones: TimelineMilestoneRepository;
      topicEditor: TopicEditorRepository;
    },
  ) {}

  async execute(era: HistoricalEra): Promise<Result<EraTimelineEditorData, AdminAuthorizationError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const [milestones, topics] = await Promise.all([
      this.dependencies.milestones.listByEra(era),
      this.dependencies.topicEditor.listAll(),
    ]);
    return success({
      era,
      milestones: milestones.toSorted((a, b) => compareHistoricalDates(a.date, b.date)),
      topicOptions: topics
        .filter((topic) => topic.era === era)
        .toSorted(compareTopicsChronologically)
        .map(({ id, title, status }) => ({ id, title, status })),
    });
  }
}
