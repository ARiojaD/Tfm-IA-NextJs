import type { AuthService } from "@/application/ports/AuthService";
import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";
import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { RateLimitPolicy } from "@/application/ports/RateLimiter";
import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { GetCurrentUserUseCase } from "@/application/use-cases/GetCurrentUserUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { ListTopicsByEraUseCase } from "@/application/use-cases/ListTopicsByEraUseCase";
import { RegisterUserUseCase } from "@/application/use-cases/RegisterUserUseCase";
import { SignInUseCase } from "@/application/use-cases/SignInUseCase";
import { SignOutUseCase } from "@/application/use-cases/SignOutUseCase";
import { BetterAuthService } from "@/infrastructure/auth/BetterAuthService";
import { type BetterAuth, createBetterAuth } from "@/infrastructure/auth/createBetterAuth";
import { HaveIBeenPwnedChecker } from "@/infrastructure/auth/HaveIBeenPwnedChecker";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryBreachedPasswordChecker } from "@/infrastructure/auth/InMemoryBreachedPasswordChecker";
import { NextSessionCookies } from "@/infrastructure/auth/NextSessionCookies";
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
import { parseAuthEnv, parseDatabaseEnv } from "./env";

// Rate limits per requester (OWASP API4). Generous for a person, tight for a script.
export const COMMENT_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };
export const QUIZ_ANSWER_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60_000 };
// Brute force: 5 attempts a minute per visitor and per account (Better Auth's own limiter does not apply
// to server-side calls, so this one is the protection).
export const SIGN_IN_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };
// Mass account creation: 5 sign-ups every 15 minutes per visitor.
export const SIGN_UP_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 15 * 60_000 };

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
function createState(repositories: Repositories, breachedPasswords: BreachedPasswordChecker) {
  const clock = new SystemClock();

  return {
    clock,
    repositories,
    breachedPasswords,
    rateLimiters: {
      comments: new InMemoryRateLimiter(COMMENT_RATE_LIMIT, clock),
      quizAnswers: new InMemoryRateLimiter(QUIZ_ANSWER_RATE_LIMIT, clock),
      signIn: new InMemoryRateLimiter(SIGN_IN_RATE_LIMIT, clock),
      signUp: new InMemoryRateLimiter(SIGN_UP_RATE_LIMIT, clock),
    },
  };
}

type State = ReturnType<typeof createState>;

// `auth` is passed apart from the state: in the app it is built per request (it reads that request's
// cookies), in the unit tests it is a single in-memory double.
function createUseCases({ clock, repositories, rateLimiters, breachedPasswords }: State, auth: AuthService) {
  const { topics, quizzes, comments } = repositories;

  return {
    listTopicsByEra: new ListTopicsByEraUseCase({ topics }),
    getTopicDetail: new GetTopicDetailUseCase(repositories),
    addComment: new AddCommentUseCase({
      topics,
      comments,
      auth,
      clock,
      ids: new RandomUuidGenerator(),
      rateLimiter: rateLimiters.comments,
    }),
    answerQuizQuestion: new AnswerQuizQuestionUseCase({ topics, quizzes, rateLimiter: rateLimiters.quizAnswers }),
    registerUser: new RegisterUserUseCase({ auth, rateLimiter: rateLimiters.signUp, breachedPasswords }),
    signIn: new SignInUseCase({ auth, rateLimiter: rateLimiters.signIn }),
    signOut: new SignOutUseCase({ auth }),
    getCurrentUser: new GetCurrentUserUseCase({ auth }),
  };
}

export type Container = ReturnType<typeof createUseCases>;

// A fresh, isolated container over in-memory data and accounts (used by the unit tests; no database needed).
export function createContainer(seed: Seed = SEED): Container {
  return createUseCases(
    createState(inMemoryRepositories(seed), new InMemoryBreachedPasswordChecker()),
    new InMemoryAuthService(),
  );
}

// The app's container, backed by PostgreSQL. Next.js re-evaluates modules on hot reload and may load this
// file from several bundles, so the connection pool and the state (repositories and rate-limit counters)
// are shared on globalThis: one pool for the whole process, never one per reload. Use cases are rebuilt on
// every call (they are cheap), so edited use-case code applies immediately.
const globalForApp = globalThis as typeof globalThis & {
  __memnonState?: State;
  __memnonDatabase?: ReturnType<typeof createDatabase>;
  __memnonAuth?: BetterAuth;
};

export function getContainer(): Container {
  if (!isBuiltWithCurrentClasses(globalForApp.__memnonState)) {
    globalForApp.__memnonState = createState(postgresRepositories(getDatabase()), new HaveIBeenPwnedChecker());
  }
  return createUseCases(globalForApp.__memnonState, new BetterAuthService(getBetterAuth(), new NextSessionCookies()));
}

// DATABASE_URL and the auth variables are validated on first use (OWASP A05): a missing or malformed
// value stops with a clear error that names the variable but never shows its value.
function getDatabase(): Database {
  globalForApp.__memnonDatabase ??= createDatabase(parseDatabaseEnv(process.env).DATABASE_URL);
  return globalForApp.__memnonDatabase.db;
}

function getBetterAuth(): BetterAuth {
  globalForApp.__memnonAuth ??= createBetterAuth(getDatabase(), parseAuthEnv(process.env));
  return globalForApp.__memnonAuth;
}

// Closes the connection pool and forgets the state (used by the integration tests between cases).
export async function closeContainer(): Promise<void> {
  const database = globalForApp.__memnonDatabase;
  globalForApp.__memnonDatabase = undefined;
  globalForApp.__memnonState = undefined;
  globalForApp.__memnonAuth = undefined;
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
    rateLimiters.quizAnswers instanceof InMemoryRateLimiter &&
    rateLimiters.signIn instanceof InMemoryRateLimiter &&
    rateLimiters.signUp instanceof InMemoryRateLimiter
  );
}
