import { type Quiz, QuizSchema } from "@/domain/entities/Quiz";
import { failure, success, type Result } from "@/shared/Result";
import { UpdateTopicQuizInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import type { IdGenerator } from "../ports/IdGenerator";
import type { QuizRepository } from "../ports/QuizRepository";
import { keepOwnId, loadTopicToEdit, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// El quiz del tema, guardado entero: sus preguntas en orden, cada una con sus opciones y la correcta. Sin
// preguntas, el quiz se elimina. El dominio comprueba el resto (opciones sin repetir y la respuesta entre
// las opciones).
export class UpdateTopicQuizUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies & { quizzes: QuizRepository; ids: IdGenerator }) {}

  async execute(input: unknown): Promise<Result<Quiz | null, TopicEditingError>> {
    const loaded = await loadTopicToEdit(this.dependencies, UpdateTopicQuizInputSchema, input);
    if (!loaded.success) return loaded;

    const { topic, data } = loaded.data;
    const { quizzes, ids } = this.dependencies;
    if (data.questions.length === 0) {
      await quizzes.replaceForTopic(topic.id, null);
      return success(null);
    }

    const existing = await quizzes.findByTopic(topic.id);
    const quizId = existing?.id ?? ids.generate();
    const idFor = keepOwnId(new Set(existing?.questions.map((question) => question.id)), ids);
    const parsed = QuizSchema.safeParse({
      id: quizId,
      topicId: topic.id,
      questions: data.questions.map(({ id, explanation, ...question }) => ({
        id: idFor(id),
        ...question,
        ...(explanation !== undefined && { explanation }),
      })),
    });
    if (!parsed.success) {
      return failure(InvalidTopicError.fromIssues(parsed.error.issues));
    }

    await quizzes.replaceForTopic(topic.id, parsed.data);
    return success(parsed.data);
  }
}
