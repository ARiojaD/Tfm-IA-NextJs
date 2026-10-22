import { beforeEach, describe, expect, it } from "vitest";
import { InvalidCommentError } from "@/application/errors/InvalidCommentError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { Clock } from "@/application/ports/Clock";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import { AddCommentUseCase } from "@/application/use-cases/AddCommentUseCase";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aComment, aTopic } from "../../fixtures/historicalTopics";

const NOW = new Date("2026-10-19T12:00:00Z");
const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar" });

// Test doubles for the ports: a frozen clock and a predictable id make results exact.
const fixedClock: Clock = { now: () => NOW };
const fixedIds: IdGenerator = { generate: () => "comment-generated" };

const validInput = { topicSlug: "julio-cesar", author: "Livia", message: "¡Qué gran estratega!" };
const VISITOR = "visitante-1";
const COMMENT_LIMIT = 3;

describe("AddCommentUseCase", () => {
  let topics: InMemoryTopicRepository;
  let comments: InMemoryCommentRepository;
  let useCase: AddCommentUseCase;

  beforeEach(() => {
    topics = new InMemoryTopicRepository([caesar]);
    comments = new InMemoryCommentRepository();
    const rateLimiter = new InMemoryRateLimiter({ limit: COMMENT_LIMIT, windowMs: 60_000 }, fixedClock);
    useCase = new AddCommentUseCase({ topics, comments, clock: fixedClock, ids: fixedIds, rateLimiter });
  });

  describe("límite de frecuencia (OWASP API4)", () => {
    it("rechaza el comentario que supera el límite del visitante, sin guardarlo", async () => {
      for (let attempt = 0; attempt < COMMENT_LIMIT; attempt++) await useCase.execute(validInput, VISITOR);

      const result = await useCase.execute(validInput, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
      expect(!result.success && result.error instanceof RateLimitExceededError && result.error.retryAfterSeconds).toBe(60);
      expect(await comments.listByTopic("topic-caesar")).toHaveLength(COMMENT_LIMIT);
    });

    it("el límite es por visitante: otro visitante puede seguir comentando", async () => {
      for (let attempt = 0; attempt < COMMENT_LIMIT; attempt++) await useCase.execute(validInput, VISITOR);

      const result = await useCase.execute(validInput, "visitante-2");

      expect(result.success).toBe(true);
    });

    it("cuenta también los intentos inválidos, para frenar a quien envía basura en bucle", async () => {
      for (let attempt = 0; attempt < COMMENT_LIMIT; attempt++) await useCase.execute({ message: "" }, VISITOR);

      const result = await useCase.execute(validInput, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });
  });

  it("crea el comentario con id, tema y fecha, y lo devuelve", async () => {
    const result = await useCase.execute(validInput, VISITOR);

    expect(result).toEqual({
      success: true,
      data: {
        id: "comment-generated",
        topicId: "topic-caesar",
        author: "Livia",
        message: "¡Qué gran estratega!",
        createdAt: NOW,
      },
    });
  });

  it("guarda el comentario en el tema", async () => {
    await useCase.execute(validInput, VISITOR);

    expect(await comments.listByTopic("topic-caesar")).toHaveLength(1);
  });

  it("recorta los espacios del autor y del mensaje", async () => {
    const result = await useCase.execute({ ...validInput, author: "  Livia  ", message: "  Hola  " }, VISITOR);

    expect(result.success && [result.data.author, result.data.message]).toEqual(["Livia", "Hola"]);
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

    await useCase.execute(validInput, VISITOR);
    const detail = await getTopicDetail.execute("julio-cesar");

    expect(detail.success && detail.data.comments.map((comment) => comment.id)).toEqual(["comment-generated", "older"]);
  });

  it("guarda el HTML como texto plano: React lo escapa al mostrarlo", async () => {
    const result = await useCase.execute({ ...validInput, message: "<script>alert('xss')</script>" }, VISITOR);

    expect(result.success && result.data.message).toBe("<script>alert('xss')</script>");
  });

  it("devuelve un error de tema no encontrado si el tema no existe, sin guardar nada", async () => {
    const result = await useCase.execute({ ...validInput, topicSlug: "augusto" }, VISITOR);

    expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
    expect(await comments.listByTopic("topic-caesar")).toEqual([]);
  });

  describe("entrada inválida", () => {
    it.each([
      ["un mensaje vacío", { message: "   " }, "message"],
      ["un mensaje de más de 500 caracteres", { message: "a".repeat(501) }, "message"],
      ["un autor de menos de 2 caracteres", { author: "L" }, "author"],
      ["un autor de más de 40 caracteres", { author: "a".repeat(41) }, "author"],
      ["un slug de tema mal formado", { topicSlug: "../admin" }, "topicSlug"],
    ])("rechaza %s indicando el campo", async (_case, overrides, field) => {
      const result = await useCase.execute({ ...validInput, ...overrides }, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(InvalidCommentError);
      expect(!result.success && result.error instanceof InvalidCommentError && result.error.fieldErrors).toHaveProperty(field);
      expect(await comments.listByTopic("topic-caesar")).toEqual([]);
    });

    it("rechaza propiedades no permitidas (prevención de Mass Assignment)", async () => {
      const result = await useCase.execute({ ...validInput, userId: "attacker-id" }, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(InvalidCommentError);
    });

    it.each([null, "texto", 42, undefined])("rechaza una entrada que no es un objeto: %j", async (input) => {
      const result = await useCase.execute(input, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(InvalidCommentError);
    });

    it("los mensajes de error están en español para mostrarlos en el formulario", async () => {
      const result = await useCase.execute({ ...validInput, message: "" }, VISITOR);

      expect(!result.success && result.error instanceof InvalidCommentError && result.error.fieldErrors.message).toEqual([
        "El comentario no puede estar vacío",
      ]);
    });
  });
});
