import { failure, success, type Result } from "@/shared/Result";
import { AnswerQuizQuestionInputSchema } from "../dto/AnswerQuizQuestionInput";
import { InvalidQuizAnswerError } from "../errors/InvalidQuizAnswerError";
import { QuizQuestionNotFoundError } from "../errors/QuizQuestionNotFoundError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { QuizRepository } from "../ports/QuizRepository";
import type { RateLimiter } from "../ports/RateLimiter";
import type { TopicRepository } from "../ports/TopicRepository";

export interface QuizAnswerFeedback {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string | null;
}

export interface AnswerQuizQuestionDependencies {
  topics: TopicRepository;
  quizzes: QuizRepository;
  rateLimiter: RateLimiter;
}

export type AnswerQuizQuestionError =
  | RateLimitExceededError
  | InvalidQuizAnswerError
  | TopicNotFoundError
  | QuizQuestionNotFoundError;

// Grades one answer on the server. The correct option is revealed only after the player answers,
// so the page never ships the solutions to the browser. The rate limit throttles scripts and abuse;
// it does not make the solutions secret (anyone can learn them by playing).
export class AnswerQuizQuestionUseCase {
  constructor(private readonly dependencies: AnswerQuizQuestionDependencies) {}

  async execute(input: unknown, requesterId: string): Promise<Result<QuizAnswerFeedback, AnswerQuizQuestionError>> {
    const decision = await this.dependencies.rateLimiter.consume(requesterId);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

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
