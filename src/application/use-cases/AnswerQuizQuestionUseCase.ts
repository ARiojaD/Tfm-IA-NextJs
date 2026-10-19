import { failure, success, type Result } from "@/shared/Result";
import { AnswerQuizQuestionInputSchema } from "../dto/AnswerQuizQuestionInput";
import { InvalidQuizAnswerError } from "../errors/InvalidQuizAnswerError";
import { QuizQuestionNotFoundError } from "../errors/QuizQuestionNotFoundError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { QuizRepository } from "../ports/QuizRepository";
import type { TopicRepository } from "../ports/TopicRepository";

export interface QuizAnswerFeedback {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string | null;
}

export interface AnswerQuizQuestionDependencies {
  topics: TopicRepository;
  quizzes: QuizRepository;
}

export type AnswerQuizQuestionError = InvalidQuizAnswerError | TopicNotFoundError | QuizQuestionNotFoundError;

// Grades one answer on the server. The correct option is revealed only after the player answers,
// so the page never ships the solutions to the browser.
export class AnswerQuizQuestionUseCase {
  constructor(private readonly dependencies: AnswerQuizQuestionDependencies) {}

  async execute(input: unknown): Promise<Result<QuizAnswerFeedback, AnswerQuizQuestionError>> {
    const parsedInput = AnswerQuizQuestionInputSchema.safeParse(input);
    if (!parsedInput.success) {
      return failure(new InvalidQuizAnswerError());
    }

    const { topicSlug, questionId, optionIndex } = parsedInput.data;
    const topic = await this.dependencies.topics.findBySlug(topicSlug);
    if (!topic) {
      return failure(new TopicNotFoundError(topicSlug));
    }

    const quiz = await this.dependencies.quizzes.findByTopic(topic.id);
    const question = quiz?.questions.find((candidate) => candidate.id === questionId);
    if (!question) {
      return failure(new QuizQuestionNotFoundError(topicSlug, questionId));
    }

    if (optionIndex >= question.options.length) {
      return failure(new InvalidQuizAnswerError("La opción elegida no existe en esta pregunta"));
    }

    return success({
      isCorrect: optionIndex === question.correctOptionIndex,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation ?? null,
    });
  }
}
