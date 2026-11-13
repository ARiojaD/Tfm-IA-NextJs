import { UpdateEraMilestonesInputSchema } from "@/application/dto/TimelineEditorInputs";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import { type TimelineMilestone, TimelineMilestoneSchema } from "@/domain/entities/TimelineMilestone";
import { failure, type Result, success } from "@/shared/Result";
import { authorizeAdminWrite } from "./authorizeAdmin";
import { keepOwnId, type TopicEditingDependencies, type TopicEditingError, validateTopicList } from "./topicEditing";

export interface UpdateEraMilestonesDependencies extends TopicEditingDependencies {
  milestones: TimelineMilestoneRepository;
  ids: IdGenerator;
}

// Guarda la cronología completa de una civilización desde el panel, como una lista entera: lo que no está
// en ella se borra. Los mismos pasos que las listas de un tema: administrador, límite de peticiones,
// entrada, ids que solo se conservan si ya eran de esta civilización y el esquema del dominio como última
// comprobación. Cada tema enlazado tiene que existir y ser de la misma civilización.
export class UpdateEraMilestonesUseCase {
  constructor(private readonly dependencies: UpdateEraMilestonesDependencies) {}

  async execute(input: unknown): Promise<Result<TimelineMilestone[], TopicEditingError>> {
    const access = await authorizeAdminWrite(this.dependencies);
    if (!access.success) return access;

    const parsed = UpdateEraMilestonesInputSchema.safeParse(input);
    if (!parsed.success) {
      return failure(InvalidTopicError.fromIssues(parsed.error.issues));
    }
    const { era, milestones: rows } = parsed.data;
    const { milestones, topicEditor, ids } = this.dependencies;

    // El tema enlazado se busca en la vista del editor, que ve los borradores.
    const linkProblems = await Promise.all(
      rows.map(async (row, index) => {
        if (row.topicId === undefined) return null;
        const topic = await topicEditor.findById(row.topicId);
        if (!topic) return `Hito ${index + 1}: el tema enlazado ya no existe`;
        return topic.era === era ? null : `Hito ${index + 1}: el tema enlazado es de otra civilización`;
      }),
    );
    const problems = linkProblems.filter((problem) => problem !== null);
    if (problems.length > 0) {
      return failure(new InvalidTopicError({ milestones: problems }));
    }

    const idFor = keepOwnId(new Set((await milestones.listByEra(era)).map((milestone) => milestone.id)), ids);
    const validated = validateTopicList(
      TimelineMilestoneSchema,
      rows.map(({ id, topicId, ...row }) => ({ ...row, id: idFor(id), era, ...(topicId !== undefined && { topicId }) })),
      "milestones",
    );
    if (!validated.success) return validated;

    await milestones.replaceForEra(era, validated.data);
    return success(validated.data);
  }
}
