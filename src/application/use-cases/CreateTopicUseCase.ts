import type { EntityId } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { CreateTopicInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import type { IdGenerator } from "../ports/IdGenerator";
import { authorizeAdminWrite, type AdminWriteError } from "./authorizeAdmin";
import { saveValidTopic, type TopicEditingDependencies, uniqueSlug } from "./topicEditing";

// Creates a topic from its basic data, as a DRAFT: invisible until an admin completes and publishes it.
// The slug comes from the title once and never changes, so links and libraries keep working.
export class CreateTopicUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies & { ids: IdGenerator }) {}

  async execute(input: unknown): Promise<Result<{ id: EntityId }, AdminWriteError | InvalidTopicError>> {
    const access = await authorizeAdminWrite(this.dependencies);
    if (!access.success) return access;

    const parsed = CreateTopicInputSchema.safeParse(input);
    if (!parsed.success) {
      return failure(InvalidTopicError.fromIssues(parsed.error.issues));
    }

    const { topicEditor, ids } = this.dependencies;
    const saved = await saveValidTopic(topicEditor, {
      id: ids.generate(),
      slug: await uniqueSlug(topicEditor, parsed.data.title),
      ...parsed.data,
      introduction: [],
      keyFacts: [],
      relatedTopicIds: [],
      status: "DRAFT",
    });
    return saved.success ? success({ id: saved.data.id }) : saved;
  }
}
