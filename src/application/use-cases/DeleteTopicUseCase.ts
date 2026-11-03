import { failure, success, type Result } from "@/shared/Result";
import { DeleteTopicInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import { TopicIsPublishedError } from "../errors/TopicIsPublishedError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import { authorizeAdminWrite } from "./authorizeAdmin";
import type { TopicEditingDependencies, TopicEditingError } from "./topicEditing";

// Deletes a draft for good (with its events, quiz and recommendations). A published topic must be
// unpublished first: two deliberate steps.
export class DeleteTopicUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  async execute(input: unknown): Promise<Result<void, TopicEditingError | TopicIsPublishedError>> {
    const access = await authorizeAdminWrite(this.dependencies);
    if (!access.success) return access;

    const parsed = DeleteTopicInputSchema.safeParse(input);
    if (!parsed.success) {
      return failure(InvalidTopicError.fromIssues(parsed.error.issues));
    }

    const topic = await this.dependencies.topicEditor.findById(parsed.data.topicId);
    if (!topic) {
      return failure(new TopicNotFoundError(parsed.data.topicId));
    }
    if (topic.status === "PUBLISHED") {
      return failure(new TopicIsPublishedError());
    }

    await this.dependencies.topicEditor.delete(topic.id);
    return success(undefined);
  }
}
