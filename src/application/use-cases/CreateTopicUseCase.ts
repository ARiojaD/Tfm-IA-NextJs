import type { EntityId } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { CreateTopicInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import type { IdGenerator } from "../ports/IdGenerator";
import { authorizeAdminWrite, type AdminWriteError } from "./authorizeAdmin";
import { saveValidTopic, type TopicEditingDependencies, uniqueSlug } from "./topicEditing";

// Crea un tema a partir de sus datos básicos, como borrador: invisible hasta que un administrador lo
// complete y lo publique. El slug sale del título una sola vez y nunca cambia, así los enlaces y las
// bibliotecas siguen funcionando.
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
