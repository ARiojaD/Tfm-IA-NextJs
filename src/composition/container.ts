// La raíz de composición: el único sitio que sabe qué implementación hay detrás de cada port. La
// aplicación usa PostgreSQL y los modelos reales; los tests unitarios, repositorios en memoria y dobles de
// IA. Los casos de uso y las páginas nunca saben cuál reciben. Aquí viven también las políticas de los
// límites de peticiones.
import type { AnswerGenerator } from "@/application/ports/AnswerGenerator";
import type { AuthService } from "@/application/ports/AuthService";
import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";
import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { ContentDrafter } from "@/application/ports/ContentDrafter";
import type { EmbeddingService } from "@/application/ports/EmbeddingService";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { ImageCatalog } from "@/application/ports/ImageCatalog";
import type { KnowledgeIndex } from "@/application/ports/KnowledgeIndex";
import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import type { LibraryRepository } from "@/application/ports/LibraryRepository";
import type { ProposalDrafter } from "@/application/ports/ProposalDrafter";
import type { ProposalRepository } from "@/application/ports/ProposalRepository";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { Clock } from "@/application/ports/Clock";
import type { RateLimiter, RateLimitPolicy } from "@/application/ports/RateLimiter";
import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { AskEncyclopediaUseCase } from "@/application/use-cases/AskEncyclopediaUseCase";
import { ChangeTopicStatusUseCase } from "@/application/use-cases/ChangeTopicStatusUseCase";
import { CreateTopicUseCase } from "@/application/use-cases/CreateTopicUseCase";
import { DeleteTopicUseCase } from "@/application/use-cases/DeleteTopicUseCase";
import { withDailyAiLimit } from "@/application/use-cases/dailyAiLimit";
import { DraftProposalUseCase } from "@/application/use-cases/DraftProposalUseCase";
import { DraftTopicEventsUseCase } from "@/application/use-cases/DraftTopicEventsUseCase";
import { DraftTopicQuizUseCase } from "@/application/use-cases/DraftTopicQuizUseCase";
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
import { GetEraTimelineForEditingUseCase } from "@/application/use-cases/GetEraTimelineForEditingUseCase";
import { GetEraTimelineUseCase } from "@/application/use-cases/GetEraTimelineUseCase";
import { UpdateEraMilestonesUseCase } from "@/application/use-cases/UpdateEraMilestonesUseCase";
import { RebuildKnowledgeIndexUseCase } from "@/application/use-cases/RebuildKnowledgeIndexUseCase";
import { RefreshTopicIndexUseCase } from "@/application/use-cases/RefreshTopicIndexUseCase";
import { refreshingTopicIndex } from "@/application/use-cases/refreshingTopicIndex";
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
import { EchoAnswerGenerator } from "@/infrastructure/ai/EchoAnswerGenerator";
import { EMBEDDING_DIMENSIONS, MIN_RELEVANT_SIMILARITY } from "@/infrastructure/ai/embeddingModel";
import { EmptyContentDrafter } from "@/infrastructure/ai/EmptyContentDrafter";
import { HashingEmbeddingService } from "@/infrastructure/ai/HashingEmbeddingService";
import type { LlmConfig } from "@/infrastructure/ai/languageModel";
import { OpenAiCompatibleAnswerGenerator } from "@/infrastructure/ai/OpenAiCompatibleAnswerGenerator";
import { OpenAiCompatibleContentDrafter } from "@/infrastructure/ai/OpenAiCompatibleContentDrafter";
import { TransformersEmbeddingService } from "@/infrastructure/ai/TransformersEmbeddingService";
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
import { InMemoryKnowledgeIndex } from "@/infrastructure/persistence/in-memory/InMemoryKnowledgeIndex";
import { InMemoryTimelineMilestoneRepository } from "@/infrastructure/persistence/in-memory/InMemoryTimelineMilestoneRepository";
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
import { PostgresKnowledgeIndex } from "@/infrastructure/persistence/postgres/PostgresKnowledgeIndex";
import { PostgresTimelineMilestoneRepository } from "@/infrastructure/persistence/postgres/PostgresTimelineMilestoneRepository";
import { PostgresLibraryRepository } from "@/infrastructure/persistence/postgres/PostgresLibraryRepository";
import { PostgresProposalRepository } from "@/infrastructure/persistence/postgres/PostgresProposalRepository";
import { PostgresQuizRepository } from "@/infrastructure/persistence/postgres/PostgresQuizRepository";
import { PostgresRecommendationRepository } from "@/infrastructure/persistence/postgres/PostgresRecommendationRepository";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";
import { PostgresRateLimiter } from "@/infrastructure/persistence/postgres/PostgresRateLimiter";
import { PostgresUserRoleRepository } from "@/infrastructure/persistence/postgres/PostgresUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { RandomUuidGenerator } from "@/infrastructure/system/RandomUuidGenerator";
import { SystemClock } from "@/infrastructure/system/SystemClock";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Result } from "@/shared/Result";
import { parseAuthEnv, parseDatabaseEnv, parseLlmEnv } from "./env";

// Límites de peticiones por solicitante (OWASP API4). Generosos para una persona y estrictos para un script.
export const COMMENT_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };
export const QUIZ_ANSWER_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60_000 };
// Fuerza bruta: 5 intentos por minuto por visitante y por cuenta (el limitador propio de Better Auth no se
// aplica a las llamadas desde el servidor, así que la protección es este).
export const SIGN_IN_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };
// Creación masiva de cuentas: 5 registros cada 15 minutos por visitante.
export const SIGN_UP_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 15 * 60_000 };
// Seguir y guardar comparten un mismo cupo por usuario: de sobra para ir haciendo clic, no para un script.
export const LIBRARY_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60_000 };

// Propuestas por usuario: suficientes para contribuir, no para inundar la bandeja de los administradores.
export const PROPOSAL_RATE_LIMIT: RateLimitPolicy = { limit: 10, windowMs: 60 * 60_000 };
// Cada cambio en el panel de administración, por administrador: generoso para editar a mano y un freno
// para una sesión robada.
export const ADMIN_RATE_LIMIT: RateLimitPolicy = { limit: 60, windowMs: 60_000 };
// Preguntas al RAG, por usuario: cada una ejecuta un modelo de lenguaje, así que esto también protege la
// cuota de una API gratuita (OWASP LLM10).
export const QUESTION_RATE_LIMIT: RateLimitPolicy = { limit: 30, windowMs: 60 * 60_000 };
// Propuestas de la IA en el panel, por administrador: aparte del cupo del panel, porque cada una ejecuta el
// modelo.
export const AI_DRAFT_RATE_LIMIT: RateLimitPolicy = { limit: 20, windowMs: 60 * 60_000 };
// Rellenar una propuesta con IA, por usuario: cada una ejecuta el modelo sobre un texto que elige el usuario.
export const PROPOSAL_DRAFT_RATE_LIMIT: RateLimitPolicy = { limit: 20, windowMs: 60 * 60_000 };
// Cuánto puede tardar un modelo local en cargarse y responder antes de que el visitante reciba los
// fragmentos en su lugar. El primer arranque de Ollama ronda el minuto.
const LLM_TIMEOUT_MS = 90_000;

interface Repositories {
  topics: TopicRepository;
  topicEditor: TopicEditorRepository;
  events: HistoricalEventRepository;
  quizzes: QuizRepository;
  comments: CommentRepository;
  recommendations: RecommendationRepository;
  library: LibraryRepository;
  roles: UserRoleRepository;
  // No es una tabla de la base de datos: las imágenes son archivos del proyecto (ver
  // `infrastructure/images/imageCatalog.ts`).
  images: ImageCatalog;
  proposals: ProposalRepository;
  // El RAG: los fragmentos de los temas publicados con sus vectores.
  knowledge: KnowledgeIndex;
  // La cronología completa de cada civilización.
  milestones: TimelineMilestoneRepository;
}

// Los tests unitarios: repositorios en memoria con el seed. Un solo almacén de temas detrás de los dos
// ports de temas, así lo que guarda el editor es lo que lee la cara pública.
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
    knowledge: new InMemoryKnowledgeIndex(),
    milestones: new InMemoryTimelineMilestoneRepository(seed.milestones),
  };
}

// La aplicación: PostgreSQL para todo salvo el catálogo de imágenes, que vive en el código.
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
    knowledge: new PostgresKnowledgeIndex(db),
    milestones: new PostgresTimelineMilestoneRepository(db),
  };
}

// Los modelos del RAG. `minSimilarity` va con el modelo de embeddings: solo tiene sentido para ese modelo.
interface Ai {
  embeddings: EmbeddingService;
  answers: AnswerGenerator;
  drafter: ContentDrafter & ProposalDrafter;
  minSimilarity: number;
  // Tope diario de llamadas al modelo para toda la web. Sin él (tests unitarios), no hay tope global.
  dailyLimit?: number;
}

const ONE_DAY_MS = 24 * 60 * 60_000;

// Crea un límite con su nombre. En la aplicación, en PostgreSQL: en Vercel hay varias instancias a la vez y
// todas tienen que compartir la cuenta. En los tests unitarios, en memoria.
type RateLimiterFactory = (name: string, policy: RateLimitPolicy, clock: Clock) => RateLimiter;

const inMemoryRateLimiters: RateLimiterFactory = (_name, policy, clock) => new InMemoryRateLimiter(policy, clock);

// El estado que vive todo el proceso. El modelo de embeddings forma parte de él: se carga una vez por
// proceso, no una vez por petición.
function createState(
  repositories: Repositories,
  breachedPasswords: BreachedPasswordChecker,
  ai: Ai,
  rateLimiter: RateLimiterFactory,
) {
  const clock = new SystemClock();
  const models =
    ai.dailyLimit === undefined
      ? ai
      : { ...ai, ...withDailyAiLimit(ai, rateLimiter("ia-global", { limit: ai.dailyLimit, windowMs: ONE_DAY_MS }, clock)) };

  return {
    clock,
    repositories,
    breachedPasswords,
    ai: models,
    rateLimiters: {
      comments: rateLimiter("comentarios", COMMENT_RATE_LIMIT, clock),
      quizAnswers: rateLimiter("quiz", QUIZ_ANSWER_RATE_LIMIT, clock),
      signIn: rateLimiter("inicio-sesion", SIGN_IN_RATE_LIMIT, clock),
      signUp: rateLimiter("registro", SIGN_UP_RATE_LIMIT, clock),
      library: rateLimiter("biblioteca", LIBRARY_RATE_LIMIT, clock),
      admin: rateLimiter("panel", ADMIN_RATE_LIMIT, clock),
      proposals: rateLimiter("propuestas", PROPOSAL_RATE_LIMIT, clock),
      questions: rateLimiter("preguntas", QUESTION_RATE_LIMIT, clock),
      aiDrafts: rateLimiter("ia-panel", AI_DRAFT_RATE_LIMIT, clock),
      proposalDrafts: rateLimiter("ia-propuestas", PROPOSAL_DRAFT_RATE_LIMIT, clock),
    },
  };
}

type State = ReturnType<typeof createState>;

// `auth` se pasa aparte del estado: en la aplicación se construye en cada petición (lee las cookies de esa
// petición) y en los tests unitarios es un único doble en memoria.
function createUseCases({ clock, repositories, rateLimiters, breachedPasswords, ai }: State, auth: AuthService) {
  const { topics, topicEditor, quizzes, comments, library, roles } = repositories;
  const ids = new RandomUuidGenerator();
  const editor = { topicEditor, auth, roles, rateLimiter: rateLimiters.admin };
  const drafting = { ...editor, rateLimiter: rateLimiters.aiDrafts, drafter: ai.drafter };
  const refreshIndex = new RefreshTopicIndexUseCase({ topicEditor, events: repositories.events, embeddings: ai.embeddings, index: repositories.knowledge });
  // Las ediciones del panel que cambian lo que indexa el RAG reindexan su tema cuando salen bien.
  const indexed = <Output, Failure extends Error>(
    useCase: { execute(input: unknown): Promise<Result<Output, Failure>> },
    topicIdOf?: (input: unknown, output: Output) => EntityId | undefined,
  ) => refreshingTopicIndex(useCase, refreshIndex, { onFailure: reportIndexFailure, topicIdOf });

  return {
    listTopicsByEra: new ListTopicsByEraUseCase({ topics }),
    getEraTimeline: new GetEraTimelineUseCase({ milestones: repositories.milestones, topics, events: repositories.events }),
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
    getEraTimelineForEditing: new GetEraTimelineForEditingUseCase({ ...repositories, auth, roles }),
    // Los hitos no se indexan en el RAG, así que guardarlos no reindexa nada.
    updateEraMilestones: new UpdateEraMilestonesUseCase({ ...editor, milestones: repositories.milestones, ids }),
    getTopicPreview: new GetTopicPreviewUseCase({ ...repositories, auth, roles }),
    createTopic: new CreateTopicUseCase({ ...editor, ids }),
    updateTopicBasics: indexed(new UpdateTopicBasicsUseCase(editor)),
    updateTopicIntroduction: indexed(new UpdateTopicIntroductionUseCase(editor)),
    updateTopicKeyFacts: indexed(new UpdateTopicKeyFactsUseCase(editor)),
    changeTopicStatus: indexed(new ChangeTopicStatusUseCase(editor)),
    deleteTopic: indexed(new DeleteTopicUseCase(editor)),
    updateTopicEvents: indexed(new UpdateTopicEventsUseCase({ ...editor, events: repositories.events, ids })),
    updateTopicQuiz: new UpdateTopicQuizUseCase({ ...editor, quizzes, ids }),
    updateTopicRecommendations: new UpdateTopicRecommendationsUseCase({ ...editor, recommendations: repositories.recommendations, ids }),
    updateRelatedTopics: new UpdateRelatedTopicsUseCase(editor),
    draftTopicEvents: new DraftTopicEventsUseCase(drafting),
    draftTopicQuiz: new DraftTopicQuizUseCase(drafting),
    updateTopicImage: new UpdateTopicImageUseCase({ ...editor, images: repositories.images }),
    submitProposal: new SubmitProposalUseCase({
      auth,
      topics,
      proposals: repositories.proposals,
      ids,
      clock,
      rateLimiter: rateLimiters.proposals,
    }),
    draftProposal: new DraftProposalUseCase({ auth, rateLimiter: rateLimiters.proposalDrafts, drafter: ai.drafter }),
    listMyProposals: new ListMyProposalsUseCase({ auth, proposals: repositories.proposals }),
    listPendingProposals: new ListPendingProposalsUseCase({ auth, roles, proposals: repositories.proposals }),
    // Un evento aprobado se une a la cronología de su tema, así que hay que reindexarlo.
    reviewProposal: indexed(new ReviewProposalUseCase({ ...editor, ...repositories, ids, clock }), (_input, { proposal }) =>
      proposal.status === "APPROVED" && proposal.kind === "EVENT" ? proposal.topicId : undefined,
    ),
    rebuildKnowledgeIndex: new RebuildKnowledgeIndexUseCase({ topicEditor, refresh: refreshIndex }),
    askEncyclopedia: new AskEncyclopediaUseCase({
      auth,
      rateLimiter: rateLimiters.questions,
      embeddings: ai.embeddings,
      index: repositories.knowledge,
      topics,
      answers: ai.answers,
      minSimilarity: ai.minSimilarity,
    }),
  };
}

// Solo el id del tema y el mensaje del error: la edición sí se guardó, y `npm run rag:index` repara el
// índice.
function reportIndexFailure(topicId: EntityId, error: unknown) {
  console.error(
    `No se pudo actualizar el índice del RAG del tema ${topicId}: ${error instanceof Error ? error.message : String(error)}`,
  );
}

export type Container = ReturnType<typeof createUseCases>;

// Un container nuevo y aislado sobre datos y cuentas en memoria (lo usan los tests unitarios; no necesita
// base de datos).
export function createContainer(seed: Seed = SEED): Container {
  return createUseCases(
    createState(
      inMemoryRepositories(seed),
      new InMemoryBreachedPasswordChecker(),
      {
        embeddings: new HashingEmbeddingService(EMBEDDING_DIMENSIONS),
        answers: new EchoAnswerGenerator(),
        drafter: new EmptyContentDrafter(),
        // El recuento de palabras da similitudes bajas: aquí cualquier fragmento es candidato.
        minSimilarity: 0,
      },
      inMemoryRateLimiters,
    ),
    new InMemoryAuthService(),
  );
}

// El container de la aplicación, sobre PostgreSQL. Next.js vuelve a evaluar los módulos en cada recarga en
// caliente y puede cargar este archivo desde varios bundles, así que el pool de conexiones y el estado
// (repositorios y modelos) se comparten en `globalThis`: un pool para todo el proceso, nunca uno por
// recarga. Los casos de uso se reconstruyen en cada llamada (son baratos), así el código
// editado de un caso de uso se aplica al momento.
const globalForApp = globalThis as typeof globalThis & {
  __memnonState?: State;
  __memnonDatabase?: ReturnType<typeof createDatabase>;
  __memnonAuth?: BetterAuth;
};

export function getContainer(): Container {
  if (!isBuiltWithCurrentClasses(globalForApp.__memnonState)) {
    globalForApp.__memnonState = createState(
      postgresRepositories(getDatabase()),
      new HaveIBeenPwnedChecker(),
      {
        embeddings: new TransformersEmbeddingService(),
        answers: new OpenAiCompatibleAnswerGenerator(llmConfig()),
        drafter: new OpenAiCompatibleContentDrafter(llmConfig()),
        minSimilarity: MIN_RELEVANT_SIMILARITY,
        dailyLimit: parseLlmEnv(process.env).LLM_DAILY_LIMIT,
      },
      (name, policy, clock) => new PostgresRateLimiter(getDatabase(), name, policy, clock),
    );
  }
  return createUseCases(globalForApp.__memnonState, new BetterAuthService(getBetterAuth(), new NextSessionCookies()));
}

// `DATABASE_URL` y las variables de autenticación se validan la primera vez que se usan (OWASP A05): un
// valor que falta o está mal formado se detiene con un error claro que nombra la variable pero nunca
// muestra su valor.
function getDatabase(): Database {
  globalForApp.__memnonDatabase ??= createDatabase(parseDatabaseEnv(process.env).DATABASE_URL);
  return globalForApp.__memnonDatabase.db;
}

function llmConfig(): LlmConfig {
  const { LLM_BASE_URL, LLM_MODEL, LLM_API_KEY, LLM_REASONING_EFFORT } = parseLlmEnv(process.env);
  return {
    baseURL: LLM_BASE_URL,
    model: LLM_MODEL,
    apiKey: LLM_API_KEY,
    timeoutMs: LLM_TIMEOUT_MS,
    reasoningEffort: LLM_REASONING_EFFORT,
  };
}

function getBetterAuth(): BetterAuth {
  globalForApp.__memnonAuth ??= createBetterAuth(getDatabase(), parseAuthEnv(process.env));
  return globalForApp.__memnonAuth;
}

// Cierra el pool de conexiones y olvida el estado (lo usan los tests de integración entre casos).
export async function closeContainer(): Promise<void> {
  const database = globalForApp.__memnonDatabase;
  globalForApp.__memnonDatabase = undefined;
  globalForApp.__memnonState = undefined;
  globalForApp.__memnonAuth = undefined;
  await database?.close();
}

// Una recarga en caliente de un módulo de infraestructura redefine su clase. Las instancias creadas antes
// conservan los métodos viejos (por ejemplo, faltaría un método de repositorio añadido después), así que
// el estado se reconstruye; el pool de conexiones se reutiliza. Solo pasa en desarrollo.
function isBuiltWithCurrentClasses(state: State | undefined): state is State {
  if (!state) return false;
  const { clock, repositories, rateLimiters, ai } = state;

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
    repositories.knowledge instanceof PostgresKnowledgeIndex &&
    repositories.milestones instanceof PostgresTimelineMilestoneRepository &&
    ai.embeddings instanceof TransformersEmbeddingService &&
    ai.answers instanceof OpenAiCompatibleAnswerGenerator &&
    ai.drafter instanceof OpenAiCompatibleContentDrafter &&
    rateLimiters.comments instanceof InMemoryRateLimiter &&
    rateLimiters.quizAnswers instanceof InMemoryRateLimiter &&
    rateLimiters.signIn instanceof InMemoryRateLimiter &&
    rateLimiters.signUp instanceof InMemoryRateLimiter &&
    rateLimiters.library instanceof InMemoryRateLimiter &&
    rateLimiters.admin instanceof InMemoryRateLimiter &&
    rateLimiters.proposals instanceof InMemoryRateLimiter &&
    rateLimiters.questions instanceof InMemoryRateLimiter &&
    rateLimiters.aiDrafts instanceof InMemoryRateLimiter &&
    rateLimiters.proposalDrafts instanceof InMemoryRateLimiter
  );
}
