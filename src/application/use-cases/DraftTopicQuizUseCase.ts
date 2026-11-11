import { type QuestionDraftRow, quizDraftRows } from "@/domain/entities/TopicDrafts";
import type { Result } from "@/shared/Result";
import { draftFromTopic, type TopicDraftingDependencies, type TopicDraftingError } from "./topicDrafting";

// La IA propone preguntas de quiz a partir del texto del tema. Solo rellena el formulario: guardar es cosa
// del administrador.
export class DraftTopicQuizUseCase {
  constructor(private readonly dependencies: TopicDraftingDependencies) {}

  execute(input: unknown): Promise<Result<QuestionDraftRow[], TopicDraftingError>> {
    return draftFromTopic(this.dependencies, input, (source) => this.dependencies.drafter.draftQuiz(source), quizDraftRows);
  }
}
