import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidQuestionError } from "@/application/errors/InvalidQuestionError";
import { KnowledgeSearchUnavailableError } from "@/application/errors/KnowledgeSearchUnavailableError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { AnswerGenerator } from "@/application/ports/AnswerGenerator";
import type { Clock } from "@/application/ports/Clock";
import type { EmbeddingService } from "@/application/ports/EmbeddingService";
import { AskEncyclopediaUseCase, MAX_ANSWER_SOURCES } from "@/application/use-cases/AskEncyclopediaUseCase";
import type { KnowledgeChunk } from "@/domain/entities/KnowledgeChunk";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryKnowledgeIndex } from "@/infrastructure/persistence/in-memory/InMemoryKnowledgeIndex";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", era: "ROMAN", category: "PEOPLE" });
const draft = aTopic({ id: "topic-draft", slug: "borrador", title: "Borrador", status: "DRAFT" });

const rubicon: KnowledgeChunk = { topicId: "topic-caesar", source: "EVENT", position: 0, eventId: "event-rubicon", content: "Cruce del Rubicón." };
const death: KnowledgeChunk = { topicId: "topic-caesar", source: "KEY_FACT", position: 1, content: "Muerte: 44 a.C." };
const unrelated: KnowledgeChunk = { topicId: "topic-caesar", source: "INTRODUCTION", position: 0, content: "Otra cosa." };
const secret: KnowledgeChunk = { topicId: "topic-draft", source: "INTRODUCTION", position: 0, content: "Texto del borrador." };

const frozenClock: Clock = { now: () => new Date("2026-11-10T10:00:00Z") };
const QUESTION = "¿Cuándo cruzó César el Rubicón?";
const close = [1, 0];
const closeToo = [0.98, 0.2];
const farAway = [0, 1];

describe("AskEncyclopediaUseCase", () => {
  let auth: InMemoryAuthService;
  let index: InMemoryKnowledgeIndex;
  let embeddings: EmbeddingService;
  let generator: { answer: ReturnType<typeof vi.fn<AnswerGenerator["answer"]>> };
  let ask: AskEncyclopediaUseCase;

  const signIn = () => auth.register({ name: "Livia", email: "livia@example.com", password: "la batalla de alesia" });

  beforeEach(async () => {
    auth = new InMemoryAuthService();
    index = new InMemoryKnowledgeIndex();
    embeddings = {
      embedDocuments: () => Promise.reject(new Error("no se usa")),
      embedQuery: vi.fn(() => Promise.resolve([1, 0])),
    };
    generator = { answer: vi.fn<AnswerGenerator["answer"]>() };
    await index.replaceTopic("topic-caesar", [
      { chunk: rubicon, embedding: close },
      { chunk: death, embedding: closeToo },
      { chunk: unrelated, embedding: farAway },
    ]);
    ask = new AskEncyclopediaUseCase({
      auth,
      rateLimiter: new InMemoryRateLimiter({ limit: 3, windowMs: 60_000 }, frozenClock),
      embeddings,
      index,
      topics: new InMemoryTopicRepository([caesar, draft]),
      answers: generator,
      minSimilarity: 0.8,
    });
  });

  it("sin sesión no busca nada", async () => {
    const result = await ask.execute({ question: QUESTION });

    expect(result).toEqual({ success: false, error: expect.any(AuthenticationRequiredError) });
    expect(embeddings.embedQuery).not.toHaveBeenCalled();
  });

  it("limita las preguntas por usuario", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "NONE", answer: "", missing: "" });
    for (let i = 0; i < 3; i++) await ask.execute({ question: QUESTION });

    const result = await ask.execute({ question: QUESTION });

    expect(result).toEqual({ success: false, error: expect.any(RateLimitExceededError) });
  });

  it.each([["una entrada sin pregunta", {}], ["una pregunta muy corta", { question: "a" }], ["una pregunta larguísima", { question: "a".repeat(301) }], ["campos de más", { question: QUESTION, topK: 1000 }]])(
    "rechaza %s",
    async (_name, input) => {
      await signIn();

      const result = await ask.execute(input);

      expect(result).toEqual({ success: false, error: expect.any(InvalidQuestionError) });
      expect(embeddings.embedQuery).not.toHaveBeenCalled();
    },
  );

  it("da al modelo solo los fragmentos relevantes, numerados y con su tema y sección", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "FULL", answer: "En el 49 a.C. [1].", missing: "" });

    await ask.execute({ question: QUESTION });

    expect(generator.answer).toHaveBeenCalledWith(QUESTION, [
      { number: 1, topicTitle: "Julio César", section: "Cronología", content: "Cruce del Rubicón." },
      { number: 2, topicTitle: "Julio César", section: "Dato clave", content: "Muerte: 44 a.C." },
    ]);
  });

  it("devuelve la respuesta con las citas y solo las fuentes citadas, renumeradas", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "FULL", answer: "Murió en el 44 a.C. [2].", missing: "" });

    const result = await ask.execute({ question: "¿Cuándo murió César?" });

    expect(result).toEqual({
      success: true,
      data: {
        status: "ANSWERED",
        coverage: "FULL",
        parts: [
          { type: "text", text: "Murió en el 44 a.C." },
          { type: "citation", number: 1 },
          { type: "text", text: "." },
        ],
        missing: null,
        sources: [{ number: 1, topic: { title: "Julio César", era: "ROMAN", category: "PEOPLE", slug: "julio-cesar" }, chunk: death }],
      },
    });
  });

  it("si solo hay parte de la información, dice qué falta", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "PARTIAL", answer: "En el 49 a.C. [1].", missing: "El número de legiones." });

    const result = await ask.execute({ question: QUESTION });

    expect(result.success && result.data).toMatchObject({ status: "ANSWERED", coverage: "PARTIAL", missing: "El número de legiones." });
  });

  it("si ningún fragmento se parece a la pregunta, no hay información y no se llama al modelo", async () => {
    await signIn();
    await index.replaceTopic("topic-caesar", [{ chunk: unrelated, embedding: farAway }]);

    const result = await ask.execute({ question: "¿Qué es la fotosíntesis?" });

    expect(result).toEqual({ success: true, data: { status: "NO_INFORMATION" } });
    expect(generator.answer).not.toHaveBeenCalled();
  });

  it("si el modelo dice que los fragmentos no responden, no hay información", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "NONE", answer: "", missing: "" });

    expect(await ask.execute({ question: QUESTION })).toEqual({ success: true, data: { status: "NO_INFORMATION" } });
  });

  it("nunca usa fragmentos de un tema que no esté publicado", async () => {
    await signIn();
    await index.replaceTopic("topic-caesar", []);
    await index.replaceTopic("topic-draft", [{ chunk: secret, embedding: close }]);

    expect(await ask.execute({ question: QUESTION })).toEqual({ success: true, data: { status: "NO_INFORMATION" } });
    expect(generator.answer).not.toHaveBeenCalled();
  });

  it("si el modelo no está disponible, muestra los fragmentos encontrados", async () => {
    await signIn();
    generator.answer.mockRejectedValue(new Error("Ollama apagado"));

    const result = await ask.execute({ question: QUESTION });

    expect(result.success && result.data).toMatchObject({
      status: "SOURCES_ONLY",
      sources: [{ number: 1, chunk: rubicon }, { number: 2, chunk: death }],
    });
  });

  it("una respuesta sin ninguna cita válida no se muestra: se muestran los fragmentos", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "FULL", answer: "Lo sé por mi cuenta [7].", missing: "" });

    const result = await ask.execute({ question: QUESTION });

    expect(result.success && result.data).toMatchObject({ status: "SOURCES_ONLY" });
  });

  it("si la búsqueda falla, lo indica sin dar detalles", async () => {
    await signIn();
    vi.mocked(embeddings.embedQuery).mockRejectedValue(new Error("detalle interno del modelo"));

    const result = await ask.execute({ question: QUESTION });

    expect(result).toEqual({ success: false, error: expect.any(KnowledgeSearchUnavailableError) });
    expect(!result.success && result.error.message).not.toContain("detalle interno");
  });

  it("nunca pasa al modelo más fragmentos del máximo", async () => {
    await signIn();
    generator.answer.mockResolvedValue({ coverage: "NONE", answer: "", missing: "" });
    await index.replaceTopic(
      "topic-caesar",
      Array.from({ length: 30 }, (_, position) => ({
        chunk: { topicId: "topic-caesar", source: "INTRODUCTION" as const, position, content: `Párrafo ${position}.` },
        embedding: close,
      })),
    );

    await ask.execute({ question: QUESTION });

    expect(generator.answer.mock.calls[0][1]).toHaveLength(MAX_ANSWER_SOURCES);
  });
});
