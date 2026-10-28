import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { RateLimitPolicy } from "@/application/ports/RateLimiter";
import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { ListTopicsByEraUseCase } from "@/application/use-cases/ListTopicsByEraUseCase";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { SEED, type Seed } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase, type Database } from "@/infrastructure/persistence/postgres/client";
import { PostgresCommentRepository } from "@/infrastructure/persistence/postgres/PostgresCommentRepository";
import { PostgresHistoricalEventRepository } from "@/infrastructure/persistence/postgres/PostgresHistoricalEventRepository";
import { PostgresQuizRepository } from "@/infrastructure/persistence/postgres/PostgresQuizRepository";
import { PostgresRecommendationRepository } from "@/infrastructure/persistence/postgres/PostgresRecommendationRepository";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { RandomUuidGenerator } from "@/infrastructure/system/RandomUuidGenerator";
import { SystemClock } from "@/infrastructure/system/SystemClock";
import { parseEnv } from "./env";

// Rate limits per requester (OWASP API4). Generous for a person, tight for a script.
export const COMMENT_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };
export const QUIZ_ANSWER_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60_000 };

interface Repositories {
  topics: TopicRepository;
  events: HistoricalEventRepository;
  quizzes: QuizRepository;
  comments: CommentRepository;
  recommendations: RecommendationRepository;
}

// The only place that knows which implementation backs each port. The app uses PostgreSQL; the unit
// tests use the in-memory repositories. Use cases and pages never know which one they get.
function inMemoryRepositories(seed: Seed): Repositories {
  return {
    topics: new InMemoryTopicRepository(seed.topics),
    events: new InMemoryHistoricalEventRepository(seed.events),
    quizzes: new InMemoryQuizRepository(seed.quizzes),
    comments: new InMemoryCommentRepository(seed.comments),
    recommendations: new InMemoryRecommendationRepository(seed.recommendations),
  };
}

function postgresRepositories(db: Database): Repositories {
  return {
    topics: new PostgresTopicRepository(db),
    events: new PostgresHistoricalEventRepository(db),
    quizzes: new PostgresQuizRepository(db),
    comments: new PostgresCommentRepository(db),
    recommendations: new PostgresRecommendationRepository(db),
  };
}

// The rate-limit counters stay in memory: valid for a single server process. With several instances
// they must move to a shared store (PostgreSQL or Redis).
function createState(repositories: Repositories) {
  const clock = new SystemClock();

  return {
    clock,
    repositories,
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
    listTopicsByEra: new ListTopicsByEraUseCase({ topics }),
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

// A fresh, isolated container over in-memory data (used by the unit tests; no database needed).
export function createContainer(seed: Seed = SEED): Container {
  return createUseCases(createState(inMemoryRepositories(seed)));
}

// The app's container, backed by PostgreSQL. Next.js re-evaluates modules on hot reload and may load this
// file from several bundles, so the connection pool and the state (repositories and rate-limit counters)
// are shared on globalThis: one pool for the whole process, never one per reload. Use cases are rebuilt on
// every call (they are cheap), so edited use-case code applies immediately.
const globalForApp = globalThis as typeof globalThis & {
  __memnonState?: State;
  __memnonDatabase?: ReturnType<typeof createDatabase>;
};

export function getContainer(): Container {
  if (!isBuiltWithCurrentClasses(globalForApp.__memnonState)) {
    globalForApp.__memnonState = createState(postgresRepositories(getDatabase()));
  }
  return createUseCases(globalForApp.__memnonState);
}

// DATABASE_URL is validated on first use (OWASP A05): a missing or malformed value stops with a clear
// error that names the variable but never shows its value.
function getDatabase(): Database {
  globalForApp.__memnonDatabase ??= createDatabase(parseEnv(process.env).DATABASE_URL);
  return globalForApp.__memnonDatabase.db;
}

// Closes the connection pool and forgets the state (used by the integration tests between cases).
export async function closeContainer(): Promise<void> {
  const database = globalForApp.__memnonDatabase;
  globalForApp.__memnonDatabase = undefined;
  globalForApp.__memnonState = undefined;
  await database?.close();
}

// A hot reload of an infrastructure module redefines its class. Instances created before keep the old
// methods (e.g. a repository method added later would be missing), so the state is rebuilt; the
// connection pool is reused. Only happens in development.
function isBuiltWithCurrentClasses(state: State | undefined): state is State {
  if (!state) return false;
  const { clock, repositories, rateLimiters } = state;

  return (
    clock instanceof SystemClock &&
    repositories.topics instanceof PostgresTopicRepository &&
    repositories.events instanceof PostgresHistoricalEventRepository &&
    repositories.quizzes instanceof PostgresQuizRepository &&
    repositories.comments instanceof PostgresCommentRepository &&
    repositories.recommendations instanceof PostgresRecommendationRepository &&
    rateLimiters.comments instanceof InMemoryRateLimiter &&
    rateLimiters.quizAnswers instanceof InMemoryRateLimiter
  );
}
