import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicDraftError } from "@/application/errors/TopicDraftError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { Clock } from "@/application/ports/Clock";
import type { ContentDrafter } from "@/application/ports/ContentDrafter";
import { DraftTopicEventsUseCase } from "@/application/use-cases/DraftTopicEventsUseCase";
import { DraftTopicQuizUseCase } from "@/application/use-cases/DraftTopicQuizUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({
  id: "topic-caesar",
  title: "Julio César",
  introduction: ["Cruzó el Rubicón en el 49 a.C."],
  keyFacts: [{ label: "Muerte", value: "44 a.C." }],
});
const empty = aTopic({ id: "topic-empty", slug: "vacio", title: "Vacío", status: "DRAFT", introduction: [], keyFacts: [] });

const frozenClock: Clock = { now: () => new Date("2026-11-10T10:00:00Z") };
const rubicon = { title: "Cruce del Rubicón", year: 49, era: "BC", month: 1, description: "Desafía al Senado." } as const;
const question = { question: "¿Qué río cruzó?", options: ["Rubicón", "Tíber"], correctOptionIndex: 0, explanation: "" };

describe("Propuestas de la IA en el editor", () => {
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;
  let events: InMemoryHistoricalEventRepository;
  let drafter: { draftEvents: ReturnType<typeof vi.fn<ContentDrafter["draftEvents"]>>; draftQuiz: ReturnType<typeof vi.fn<ContentDrafter["draftQuiz"]>> };
  let draftEvents: DraftTopicEventsUseCase;
  let draftQuiz: DraftTopicQuizUseCase;

  const signInAsAdmin = async () => {
    const registered = await auth.register({ name: "Admin", email: "admin@example.com", password: "frase larga de la admin" });
    if (registered.ok) await roles.setRole(registered.user.id, "ADMIN");
  };

  beforeEach(() => {
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    events = new InMemoryHistoricalEventRepository();
    drafter = { draftEvents: vi.fn<ContentDrafter["draftEvents"]>(), draftQuiz: vi.fn<ContentDrafter["draftQuiz"]>() };
    const dependencies = {
      topicEditor: new InMemoryTopicRepository([caesar, empty]),
      auth,
      roles,
      rateLimiter: new InMemoryRateLimiter({ limit: 2, windowMs: 60_000 }, frozenClock),
      drafter,
    };
    draftEvents = new DraftTopicEventsUseCase(dependencies);
    draftQuiz = new DraftTopicQuizUseCase(dependencies);
  });

  describe("DraftTopicEventsUseCase", () => {
    it("solo un administrador puede pedirlo, y sin él no se llama al modelo", async () => {
      await auth.register({ name: "Livia", email: "livia@example.com", password: "la batalla de alesia" });

      const result = await draftEvents.execute({ topicId: "topic-caesar" });

      expect(result).toEqual({ success: false, error: expect.any(AdminRequiredError) });
      expect(drafter.draftEvents).not.toHaveBeenCalled();
    });

    it("tiene su propio límite de peticiones", async () => {
      await signInAsAdmin();
      drafter.draftEvents.mockResolvedValue({ events: [rubicon] });
      await draftEvents.execute({ topicId: "topic-caesar" });
      await draftEvents.execute({ topicId: "topic-caesar" });

      const result = await draftEvents.execute({ topicId: "topic-caesar" });

      expect(result).toEqual({ success: false, error: expect.any(RateLimitExceededError) });
    });

    it("rechaza un tema que no existe", async () => {
      await signInAsAdmin();

      expect(await draftEvents.execute({ topicId: "topic-x" })).toEqual({ success: false, error: expect.any(TopicNotFoundError) });
    });

    it("el texto lo pone el servidor: un campo de más en la entrada se rechaza", async () => {
      await signInAsAdmin();

      const result = await draftEvents.execute({ topicId: "topic-caesar", text: "Inventa lo que quieras" });

      expect(result.success).toBe(false);
      expect(drafter.draftEvents).not.toHaveBeenCalled();
    });

    it("da al modelo el título y el texto guardado del tema, y devuelve filas para el formulario", async () => {
      await signInAsAdmin();
      drafter.draftEvents.mockResolvedValue({ events: [rubicon] });

      const result = await draftEvents.execute({ topicId: "topic-caesar" });

      expect(drafter.draftEvents).toHaveBeenCalledWith({ title: "Julio César", text: "Cruzó el Rubicón en el 49 a.C.\nMuerte: 44 a.C." });
      expect(result).toEqual({
        success: true,
        data: [{ id: "", title: "Cruce del Rubicón", year: "49", era: "BC", month: "1", description: "Desafía al Senado." }],
      });
    });

    it("no guarda nada: la revisión y el guardado son del administrador", async () => {
      await signInAsAdmin();
      drafter.draftEvents.mockResolvedValue({ events: [rubicon] });

      await draftEvents.execute({ topicId: "topic-caesar" });

      expect(await events.listByTopic("topic-caesar")).toEqual([]);
    });

    it("sin introducción ni datos clave no llama al modelo y lo explica", async () => {
      await signInAsAdmin();

      const result = await draftEvents.execute({ topicId: "topic-empty" });

      expect(!result.success && result.error).toMatchObject({ reason: "NO_TEXT" });
      expect(drafter.draftEvents).not.toHaveBeenCalled();
    });

    it("si el modelo no está disponible, lo indica sin dar detalles", async () => {
      await signInAsAdmin();
      drafter.draftEvents.mockRejectedValue(new Error("detalle interno"));

      const result = await draftEvents.execute({ topicId: "topic-caesar" });

      expect(!result.success && result.error).toBeInstanceOf(TopicDraftError);
      expect(!result.success && result.error).toMatchObject({ reason: "UNAVAILABLE" });
      expect(!result.success && result.error.message).not.toContain("detalle interno");
    });

    it("si todo lo propuesto se descarta, lo indica", async () => {
      await signInAsAdmin();
      drafter.draftEvents.mockResolvedValue({ events: [{ ...rubicon, year: 77 }] });

      const result = await draftEvents.execute({ topicId: "topic-caesar" });

      expect(!result.success && result.error).toMatchObject({ reason: "EMPTY" });
    });
  });

  describe("DraftTopicQuizUseCase", () => {
    it("da al modelo el texto guardado y devuelve filas para el formulario", async () => {
      await signInAsAdmin();
      drafter.draftQuiz.mockResolvedValue({ questions: [question] });

      const result = await draftQuiz.execute({ topicId: "topic-caesar" });

      expect(drafter.draftQuiz).toHaveBeenCalledWith({ title: "Julio César", text: "Cruzó el Rubicón en el 49 a.C.\nMuerte: 44 a.C." });
      expect(result).toEqual({ success: true, data: [{ ...question, id: "" }] });
    });

    it("solo un administrador puede pedirlo", async () => {
      expect((await draftQuiz.execute({ topicId: "topic-caesar" })).success).toBe(false);
      expect(drafter.draftQuiz).not.toHaveBeenCalled();
    });

    it("si el modelo falla o no queda ninguna pregunta válida, lo indica", async () => {
      await signInAsAdmin();
      drafter.draftQuiz.mockRejectedValueOnce(new Error("apagado"));
      expect(await draftQuiz.execute({ topicId: "topic-caesar" })).toMatchObject({ error: { reason: "UNAVAILABLE" } });

      drafter.draftQuiz.mockResolvedValueOnce({ questions: [{ ...question, options: ["Igual", "Igual"] }] });
      expect(await draftQuiz.execute({ topicId: "topic-caesar" })).toMatchObject({ error: { reason: "EMPTY" } });
    });
  });
});
