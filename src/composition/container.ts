import type { AuthService } from "@/application/ports/AuthService";
import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";
import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { ImageCatalog } from "@/application/ports/ImageCatalog";
import type { LibraryRepository } from "@/application/ports/LibraryRepository";
import type { ProposalRepository } from "@/application/ports/ProposalRepository";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { RateLimitPolicy } from "@/application/ports/RateLimiter";
import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { ChangeTopicStatusUseCase } from "@/application/use-cases/ChangeTopicStatusUseCase";
import { CreateTopicUseCase } from "@/application/use-cases/CreateTopicUseCase";
import { DeleteTopicUseCase } from "@/application/use-cases/DeleteTopicUseCase";
import { GetAdminAccessUseCase } from "@/application/use-cases/GetAdminAccessUseCase";
import { GetCurrentUserUseCase } from "@/application/use-cases/GetCurrentUserUseCase";
import { GetLibraryStatusUseCase } from "@/application/use-cases/GetLibraryStatusUseCase";
import { GetMyLibraryUseCase } from "@/application/use-cases/GetMyLibraryUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { GetTopicForEditingUseCase } from "@/application/use-cases/GetTopicForEditingUseCase";
import { GetTopicPreviewUseCase } from "@/application/use-cases/GetTopicPreviewUseCase";
import { ListMyProposalsUseCase } from "@/application/use-cases/ListMyProposalsUseCase";
import { ListPendingProposalsUseCase } from "@/application/use-cases/ListPendingProposalsUseCase";
import { ListTopicsByEraUseCase } from "@/application/use-cases/ListTopicsByEraUseCase";
import { ListTopicsForAdminUseCase } from "@/application/use-cases/ListTopicsForAdminUseCase";
import { RegisterUserUseCase } from "@/application/use-cases/RegisterUserUseCase";
import { ReviewProposalUseCase } from "@/application/use-cases/ReviewProposalUseCase";
import { SignInUseCase } from "@/application/use-cases/SignInUseCase";
import { SignOutUseCase } from "@/application/use-cases/SignOutUseCase";
import { SubmitProposalUseCase } from "@/application/use-cases/SubmitProposalUseCase";
import { UpdateEraFollowUseCase } from "@/application/use-cases/UpdateEraFollowUseCase";
import { UpdateSavedTopicUseCase } from "@/application/use-cases/UpdateSavedTopicUseCase";
import { UpdateRelatedTopicsUseCase } from "@/application/use-cases/UpdateRelatedTopicsUseCase";
import { UpdateTopicBasicsUseCase } from "@/application/use-cases/UpdateTopicBasicsUseCase";
import { UpdateTopicEventsUseCase } from "@/application/use-cases/UpdateTopicEventsUseCase";
import { UpdateTopicImageUseCase } from "@/application/use-cases/UpdateTopicImageUseCase";
import { UpdateTopicIntroductionUseCase } from "@/application/use-cases/UpdateTopicIntroductionUseCase";
import { UpdateTopicKeyFactsUseCase } from "@/application/use-cases/UpdateTopicKeyFactsUseCase";
import { UpdateTopicQuizUseCase } from "@/application/use-cases/UpdateTopicQuizUseCase";
import { UpdateTopicRecommendationsUseCase } from "@/application/use-cases/UpdateTopicRecommendationsUseCase";
import { BetterAuthService } from "@/infrastructure/auth/BetterAuthService";
import { type BetterAuth, createBetterAuth } from "@/infrastructure/auth/createBetterAuth";
import { HaveIBeenPwnedChecker } from "@/infrastructure/auth/HaveIBeenPwnedChecker";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryBreachedPasswordChecker } from "@/infrastructure/auth/InMemoryBreachedPasswordChecker";
import { NextSessionCookies } from "@/infrastructure/auth/NextSessionCookies";
import { IMAGE_CATALOG } from "@/infrastructure/images/imageCatalog";
import { StaticImageCatalog } from "@/infrastructure/images/StaticImageCatalog";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryLibraryRepository } from "@/infrastructure/persistence/in-memory/InMemoryLibraryRepository";
import { InMemoryProposalRepository } from "@/infrastructure/persistence/in-memory/InMemoryProposalRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { SEED, type Seed } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase, type Database } from "@/infrastructure/persistence/postgres/client";
import { PostgresCommentRepository } from "@/infrastructure/persistence/postgres/PostgresCommentRepository";
import { PostgresHistoricalEventRepository } from "@/infrastructure/persistence/postgres/PostgresHistoricalEventRepository";
import { PostgresLibraryRepository } from "@/infrastructure/persistence/postgres/PostgresLibraryRepository";
import { PostgresProposalRepository } from "@/infrastructure/persistence/postgres/PostgresProposalRepository";
import { PostgresQuizRepository } from "@/infrastructure/persistence/postgres/PostgresQuizRepository";
import { PostgresRecommendationRepository } from "@/infrastructure/persistence/postgres/PostgresRecommendationRepository";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { PostgresUserRoleRepository } from "@/infrastructure/persistence/postgres/PostgresUserRoleRepository";
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
// Following and saving share one budget per user: plenty for clicking around, not for a script.
export const LIBRARY_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60_000 };

// Every change in the admin panel, per admin: generous for editing by hand, a brake on a stolen session.
// Proposals per user: enough to contribute, not to flood the admins' inbox.
export const PROPOSAL_RATE_LIMIT: RateLimitPolicy = { limit: 10, windowMs: 60 * 60_000 };
export const ADMIN_RATE_LIMIT: RateLimitPolicy = { limit: 60, windowMs: 60_000 };

interface Repositories {
  topics: TopicRepository;
  topicEditor: TopicEditorRepository;
  events: HistoricalEventRepository;
  quizzes: QuizRepository;
  comments: CommentRepository;
  recommendations: RecommendationRepository;
  library: LibraryRepository;
  roles: UserRoleRepository;
  // Not a database table: the images are files of the project (see infrastructure/images/imageCatalog.ts).
  images: ImageCatalog;
  proposals: ProposalRepository;
}

// The only place that knows which implementation backs each port. The app uses PostgreSQL; the unit
// tests use the in-memory repositories. Use cases and pages never know which one they get.
// One topic store behind both topic ports, so what the editor saves is what the public side reads.
function inMemoryRepositories(seed: Seed): Repositories {
  const topics = new InMemoryTopicRepository(seed.topics);

  return {
    topics,
    topicEditor: topics,
    events: new InMemoryHistoricalEventRepository(seed.events),
    quizzes: new InMemoryQuizRepository(seed.quizzes),
    comments: new InMemoryCommentRepository(seed.comments),
    recommendations: new InMemoryRecommendationRepository(seed.recommendations),
    library: new InMemoryLibraryRepository(),
    roles: new InMemoryUserRoleRepository(),
    images: new StaticImageCatalog(IMAGE_CATALOG),
    proposals: new InMemoryProposalRepository(),
  };
}

function postgresRepositories(db: Database): Repositories {
  const topics = new PostgresTopicRepository(db);

  return {
    topics,
    topicEditor: topics,
    events: new PostgresHistoricalEventRepository(db),
    quizzes: new PostgresQuizRepository(db),
    comments: new PostgresCommentRepository(db),
    recommendations: new PostgresRecommendationRepository(db),
    library: new PostgresLibraryRepository(db),
    roles: new PostgresUserRoleRepository(db),
    images: new StaticImageCatalog(IMAGE_CATALOG),
    proposals: new PostgresProposalRepository(db),
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
      library: new InMemoryRateLimiter(LIBRARY_RATE_LIMIT, clock),
      admin: new InMemoryRateLimiter(ADMIN_RATE_LIMIT, clock),
      proposals: new InMemoryRateLimiter(PROPOSAL_RATE_LIMIT, clock),
    },
  };
}

type State = ReturnType<typeof createState>;

// `auth` is passed apart from the state: in the app it is built per request (it reads that request's
// cookies), in the unit tests it is a single in-memory double.
function createUseCases({ clock, repositories, rateLimiters, breachedPasswords }: State, auth: AuthService) {
  const { topics, topicEditor, quizzes, comments, library, roles } = repositories;
  const ids = new RandomUuidGenerator();
  const editor = { topicEditor, auth, roles, rateLimiter: rateLimiters.admin };

  return {
    listTopicsByEra: new ListTopicsByEraUseCase({ topics }),
    getTopicDetail: new GetTopicDetailUseCase(repositories),
    addComment: new AddCommentUseCase({
      topics,
      comments,
      auth,
      clock,
      ids,
      rateLimiter: rateLimiters.comments,
    }),
    answerQuizQuestion: new AnswerQuizQuestionUseCase({ topics, quizzes, rateLimiter: rateLimiters.quizAnswers }),
    registerUser: new RegisterUserUseCase({ auth, rateLimiter: rateLimiters.signUp, breachedPasswords }),
    signIn: new SignInUseCase({ auth, rateLimiter: rateLimiters.signIn }),
    signOut: new SignOutUseCase({ auth }),
    getCurrentUser: new GetCurrentUserUseCase({ auth, roles }),
    updateEraFollow: new UpdateEraFollowUseCase({ library, auth, rateLimiter: rateLimiters.library }),
    updateSavedTopic: new UpdateSavedTopicUseCase({ topics, library, auth, clock, rateLimiter: rateLimiters.library }),
    getLibraryStatus: new GetLibraryStatusUseCase({ library, auth }),
    getMyLibrary: new GetMyLibraryUseCase({ topics, library, auth }),
    getAdminAccess: new GetAdminAccessUseCase({ auth, roles }),
    listTopicsForAdmin: new ListTopicsForAdminUseCase({ topicEditor, auth, roles }),
    getTopicForEditing: new GetTopicForEditingUseCase({ ...repositories, auth, roles }),
    getTopicPreview: new GetTopicPreviewUseCase({ ...repositories, auth, roles }),
    createTopic: new CreateTopicUseCase({ ...editor, ids }),
    updateTopicBasics: new UpdateTopicBasicsUseCase(editor),
    updateTopicIntroduction: new UpdateTopicIntroductionUseCase(editor),
    updateTopicKeyFacts: new UpdateTopicKeyFactsUseCase(editor),
    changeTopicStatus: new ChangeTopicStatusUseCase(editor),
    deleteTopic: new DeleteTopicUseCase(editor),
    updateTopicEvents: new UpdateTopicEventsUseCase({ ...editor, events: repositories.events, ids }),
    updateTopicQuiz: new UpdateTopicQuizUseCase({ ...editor, quizzes, ids }),
    updateTopicRecommendations: new UpdateTopicRecommendationsUseCase({ ...editor, recommendations: repositories.recommendations, ids }),
    updateRelatedTopics: new UpdateRelatedTopicsUseCase(editor),
    updateTopicImage: new UpdateTopicImageUseCase({ ...editor, images: repositories.images }),
    submitProposal: new SubmitProposalUseCase({
      auth,
      topics,
      proposals: repositories.proposals,
      ids,
      clock,
      rateLimiter: rateLimiters.proposals,
    }),
    listMyProposals: new ListMyProposalsUseCase({ auth, proposals: repositories.proposals }),
    listPendingProposals: new ListPendingProposalsUseCase({ auth, roles, proposals: repositories.proposals }),
    reviewProposal: new ReviewProposalUseCase({ ...editor, ...repositories, ids, clock }),
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
    repositories.library instanceof PostgresLibraryRepository &&
    repositories.roles instanceof PostgresUserRoleRepository &&
    repositories.images instanceof StaticImageCatalog &&
    repositories.proposals instanceof PostgresProposalRepository &&
    rateLimiters.comments instanceof InMemoryRateLimiter &&
    rateLimiters.quizAnswers instanceof InMemoryRateLimiter &&
    rateLimiters.signIn instanceof InMemoryRateLimiter &&
    rateLimiters.signUp instanceof InMemoryRateLimiter &&
    rateLimiters.library instanceof InMemoryRateLimiter &&
    rateLimiters.admin instanceof InMemoryRateLimiter &&
    rateLimiters.proposals instanceof InMemoryRateLimiter
  );
}
