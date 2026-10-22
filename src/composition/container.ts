import type { RateLimitPolicy } from "@/application/ports/RateLimiter";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { SEED, type Seed } from "@/infrastructure/persistence/in-memory/seed";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { RandomUuidGenerator } from "@/infrastructure/system/RandomUuidGenerator";
import { SystemClock } from "@/infrastructure/system/SystemClock";

// Rate limits per requester (OWASP API4). Generous for a person, tight for a script.
export const COMMENT_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };
export const QUIZ_ANSWER_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60_000 };

// The only place that knows which implementation backs each port. Moving to PostgreSQL (and to a
// shared rate-limit store such as Redis) means replacing the InMemory* classes here; use cases,
// pages and their tests stay untouched.
function createState(seed: Seed) {
  const clock = new SystemClock();

  return {
    clock,
    repositories: {
      topics: new InMemoryTopicRepository(seed.topics),
      events: new InMemoryHistoricalEventRepository(seed.events),
      quizzes: new InMemoryQuizRepository(seed.quizzes),
      comments: new InMemoryCommentRepository(seed.comments),
      recommendations: new InMemoryRecommendationRepository(seed.recommendations),
    },
    rateLimiters: {
      comments: new InMemoryRateLimiter(COMMENT_RATE_LIMIT, clock),
      quizAnswers: new InMemoryRateLimiter(QUIZ_ANSWER_RATE_LIMIT, clock),
    },
  };
}

type State = ReturnType<typeof createState>;

function createUseCases({ clock, repositories, rateLimiters }: State) {
  const { topics, quizzes, comments } = repositories;

  return {
    getTopicDetail: new GetTopicDetailUseCase(repositories),
    addComment: new AddCommentUseCase({
      topics,
      comments,
      clock,
      ids: new RandomUuidGenerator(),
      rateLimiter: rateLimiters.comments,
    }),
    answerQuizQuestion: new AnswerQuizQuestionUseCase({ topics, quizzes, rateLimiter: rateLimiters.quizAnswers }),
  };
}

export type Container = ReturnType<typeof createUseCases>;

// A fresh, isolated container (used by tests).
export function createContainer(seed: Seed = SEED): Container {
  return createUseCases(createState(seed));
}

// Only the state (repositories and rate-limit counters) is shared app-wide on globalThis: Next.js
// re-evaluates modules on hot reload and may load this file from several bundles, and a module-level
// variable would split the in-memory store. Use cases are rebuilt on every call (they are cheap), so
// edited use-case code applies immediately instead of an instance created before the edit lingering.
const globalForState = globalThis as typeof globalThis & { __memnonState?: State };

export function getContainer(): Container {
  globalForState.__memnonState ??= createState(SEED);
  return createUseCases(globalForState.__memnonState);
}
