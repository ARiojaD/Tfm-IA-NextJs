import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";
import { type GetTopicDetailDependencies, loadTopicDetail, type TopicDetail } from "./GetTopicDetailUseCase";

// La vista previa de un tema, también de un borrador: exactamente lo que mostrará su página pública,
// construido de la misma forma.
export class GetTopicPreviewUseCase {
  constructor(
    private readonly dependencies: AdminAuthorizationDependencies &
      GetTopicDetailDependencies & { topicEditor: TopicEditorRepository },
  ) {}

  async execute(topicId: string): Promise<Result<TopicDetail, AdminAuthorizationError | TopicNotFoundError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const id = EntityIdSchema.safeParse(topicId);
    const topic = id.success ? await this.dependencies.topicEditor.findById(id.data) : null;
    if (!topic) {
      return failure(new TopicNotFoundError(topicId));
    }
    return success(await loadTopicDetail(topic, this.dependencies));
  }
}
