import { beforeEach, describe, expect, it } from "vitest";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidCommentError } from "@/application/errors/InvalidCommentError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AuthenticatedUser } from "@/application/ports/AuthService";
import type { Clock } from "@/application/ports/Clock";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aComment, aTopic } from "../../fixtures/historicalTopics";

const NOW = new Date("2026-10-19T12:00:00Z");
const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar" });

// Dobles de prueba de los ports: un reloj congelado y un id predecible hacen exactos los resultados.
const fixedClock: Clock = { now: () => NOW };
const fixedIds: IdGenerator = { generate: () => "comment-generated" };

const validInput = { topicSlug: "julio-cesar", message: "¡Qué gran estratega!" };
const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };
const COMMENT_LIMIT = 3;

describe("AddCommentUseCase", () => {
  let topics: InMemoryTopicRepository;
  let comments: InMemoryCommentRepository;
  let auth: InMemoryAuthService;
  let useCase: AddCommentUseCase;
  let user: AuthenticatedUser;

  beforeEach(async () => {
    topics = new InMemoryTopicRepository([caesar]);
    comments = new InMemoryCommentRepository();
    auth = new InMemoryAuthService();
    const registered = await auth.register(livia);
    user = registered.ok ? registered.user : { id: "", name: "" };
    const rateLimiter = new InMemoryRateLimiter({ limit: COMMENT_LIMIT, windowMs: 60_000 }, fixedClock);
    useCase = new AddCommentUseCase({ topics, comments, auth, clock: fixedClock, ids: fixedIds, rateLimiter });
  });

  describe("sesión (OWASP A01: control de acceso)", () => {
    it("sin sesión iniciada no se puede comentar, y no se guarda nada", async () => {
      await auth.signOut();

      const result = await useCase.execute(validInput);

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
      expect(await comments.listByTopic("topic-caesar")).toEqual([]);
    });

    it("el autor y el usuario salen de la sesión, no del formulario", async () => {
      const result = await useCase.execute(validInput);

      expect(result.success && [result.data.author, result.data.userId]).toEqual(["Livia", user.id]);
    });

    it.each([
      ["el autor", { author: "Otra persona" }],
      ["el usuario", { userId: "id-de-otra-persona" }],
    ])("rechaza que el formulario intente fijar %s (suplantación por Mass Assignment)", async (_case, extra) => {
      const result = await useCase.execute({ ...validInput, ...extra });

      expect(!result.success && result.error).toBeInstanceOf(InvalidCommentError);
      expect(await comments.listByTopic("topic-caesar")).toEqual([]);
    });
  });

  describe("límite de frecuencia (OWASP API4)", () => {
    it("rechaza el comentario que supera el límite del usuario, sin guardarlo", async () => {
      for (let attempt = 0; attempt < COMMENT_LIMIT; attempt++) await useCase.execute(validInput);

      const result = await useCase.execute(validInput);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
      expect(!result.success && result.error instanceof RateLimitExceededError && result.error.retryAfterSeconds).toBe(60);
      expect(await comments.listByTopic("topic-caesar")).toHaveLength(COMMENT_LIMIT);
    });

    it("el límite es por usuario: otro usuario puede seguir comentando", async () => {
      for (let attempt = 0; attempt < COMMENT_LIMIT; attempt++) await useCase.execute(validInput);
      await auth.register({ name: "Marco", email: "marco@example.com", password: "el cruce del rubicon" });

      const result = await useCase.execute(validInput);

      expect(result.success && result.data.author).toBe("Marco");
    });

    it("cuenta también los intentos inválidos, para frenar a quien envía basura en bucle", async () => {
      for (let attempt = 0; attempt < COMMENT_LIMIT; attempt++) await useCase.execute({ message: "" });

      const result = await useCase.execute(validInput);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });
  });

  it("crea el comentario con id, tema, usuario, autor y fecha, y lo devuelve", async () => {
    const result = await useCase.execute(validInput);

    expect(result).toEqual({
      success: true,
      data: {
        id: "comment-generated",
        topicId: "topic-caesar",
        userId: user.id,
        author: "Livia",
        message: "¡Qué gran estratega!",
        createdAt: NOW,
      },
    });
  });

  it("guarda el comentario en el tema", async () => {
    await useCase.execute(validInput);

    expect(await comments.listByTopic("topic-caesar")).toHaveLength(1);
  });

  it("recorta los espacios del mensaje", async () => {
    const result = await useCase.execute({ ...validInput, message: "  Hola  " });

    expect(result.success && result.data.message).toBe("Hola");
  });

  it("el comentario nuevo aparece el primero al consultar el tema", async () => {
    await comments.add(aComment({ id: "older", topicId: "topic-caesar", createdAt: new Date("2026-10-18T12:00:00Z") }));
    const getTopicDetail = new GetTopicDetailUseCase({
      topics,
      comments,
      events: new InMemoryHistoricalEventRepository(),
      quizzes: new InMemoryQuizRepository(),
      recommendations: new InMemoryRecommendationRepository(),
    });

    await useCase.execute(validInput);
    const detail = await getTopicDetail.execute("julio-cesar");

    expect(detail.success && detail.data.comments.map((comment) => comment.id)).toEqual(["comment-generated", "older"]);
  });

  it("guarda el HTML como texto plano: React lo escapa al mostrarlo", async () => {
    const result = await useCase.execute({ ...validInput, message: "<script>alert('xss')</script>" });

    expect(result.success && result.data.message).toBe("<script>alert('xss')</script>");
  });

  it("devuelve un error de tema no encontrado si el tema no existe, sin guardar nada", async () => {
    const result = await useCase.execute({ ...validInput, topicSlug: "augusto" });

    expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
    expect(await comments.listByTopic("topic-caesar")).toEqual([]);
  });

  describe("entrada inválida", () => {
    it.each([
      ["un mensaje vacío", { message: "   " }, "message"],
      ["un mensaje de más de 500 caracteres", { message: "a".repeat(501) }, "message"],
      ["un slug de tema mal formado", { topicSlug: "../admin" }, "topicSlug"],
    ])("rechaza %s indicando el campo", async (_case, overrides, field) => {
      const result = await useCase.execute({ ...validInput, ...overrides });

      expect(!result.success && result.error).toBeInstanceOf(InvalidCommentError);
      expect(!result.success && result.error instanceof InvalidCommentError && result.error.fieldErrors).toHaveProperty(field);
      expect(await comments.listByTopic("topic-caesar")).toEqual([]);
    });

    it.each([null, "texto", 42, undefined])("rechaza una entrada que no es un objeto: %j", async (input) => {
      const result = await useCase.execute(input);

      expect(!result.success && result.error).toBeInstanceOf(InvalidCommentError);
    });

    it("los mensajes de error están en español para mostrarlos en el formulario", async () => {
      const result = await useCase.execute({ ...validInput, message: "" });

      expect(!result.success && result.error instanceof InvalidCommentError && result.error.fieldErrors.message).toEqual([
        "El comentario no puede estar vacío",
      ]);
    });
  });
});
