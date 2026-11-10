import { type QuestionDraftRow, quizDraftRows } from "@/domain/entities/TopicDrafts";
import type { Result } from "@/shared/Result";
import { draftFromTopic, type TopicDraftingDependencies, type TopicDraftingError } from "./topicDrafting";

// The AI proposes quiz questions from the topic's text. It only fills the form: saving is the administrator's.
export class DraftTopicQuizUseCase {
  constructor(private readonly dependencies: TopicDraftingDependencies) {}

  execute(input: unknown): Promise<Result<QuestionDraftRow[], TopicDraftingError>> {
    return draftFromTopic(this.dependencies, input, (source) => this.dependencies.drafter.draftQuiz(source), quizDraftRows);
  }
}
