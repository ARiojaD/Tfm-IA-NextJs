import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { SEED, type Seed } from "@/infrastructure/persistence/in-memory/seed";
import { RandomUuidGenerator } from "@/infrastructure/system/RandomUuidGenerator";
import { SystemClock } from "@/infrastructure/system/SystemClock";

// The only place that knows which implementation backs each port. Moving to PostgreSQL means
// replacing the InMemory* repositories here; use cases, pages and their tests stay untouched.
function createRepositories(seed: Seed) {
  return {
    topics: new InMemoryTopicRepository(seed.topics),
    events: new InMemoryHistoricalEventRepository(seed.events),
    quizzes: new InMemoryQuizRepository(seed.quizzes),
    comments: new InMemoryCommentRepository(seed.comments),
    recommendations: new InMemoryRecommendationRepository(seed.recommendations),
  };
}

type Repositories = ReturnType<typeof createRepositories>;

function createUseCases(repositories: Repositories) {
  const { topics, quizzes, comments } = repositories;

  return {
    getTopicDetail: new GetTopicDetailUseCase(repositories),
    addComment: new AddCommentUseCase({ topics, comments, clock: new SystemClock(), ids: new RandomUuidGenerator() }),
    answerQuizQuestion: new AnswerQuizQuestionUseCase({ topics, quizzes }),
  };
}

export type Container = ReturnType<typeof createUseCases>;

// A fresh, isolated container (used by tests).
export function createContainer(seed: Seed = SEED): Container {
  return createUseCases(createRepositories(seed));
}

// Only the repositories (the data) are shared app-wide on globalThis: Next.js re-evaluates modules on
// hot reload and may load this file from several bundles, and a module-level variable would split
// the in-memory store. Use cases are rebuilt on every call (they are cheap), so edited use-case code
// applies immediately instead of an instance created before the edit lingering until a restart.
const globalForRepositories = globalThis as typeof globalThis & { __memnonRepositories?: Repositories };

export function getContainer(): Container {
  globalForRepositories.__memnonRepositories ??= createRepositories(SEED);
  return createUseCases(globalForRepositories.__memnonRepositories);
}
