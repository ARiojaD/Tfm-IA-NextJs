import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// The topic as the editor shows it, drafts included. The id comes from the URL.
export class GetTopicForEditingUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies & { topicEditor: TopicEditorRepository }) {}

  async execute(topicId: string): Promise<Result<HistoricalTopic, AdminAuthorizationError | TopicNotFoundError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const id = EntityIdSchema.safeParse(topicId);
    const topic = id.success ? await this.dependencies.topicEditor.findById(id.data) : null;
    return topic ? success(topic) : failure(new TopicNotFoundError(topicId));
  }
}
