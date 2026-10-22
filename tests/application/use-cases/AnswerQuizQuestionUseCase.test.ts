import { describe, expect, it } from "vitest";
import { InvalidQuizAnswerError } from "@/application/errors/InvalidQuizAnswerError";
import { QuizQuestionNotFoundError } from "@/application/errors/QuizQuestionNotFoundError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { Clock } from "@/application/ports/Clock";
import { AnswerQuizQuestionUseCase } from "@/application/use-cases/AnswerQuizQuestionUseCase";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aQuiz, aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar" });
const pericles = aTopic({ id: "topic-pericles", slug: "pericles", era: "ANCIENT_GREECE" });

const caesarQuiz = aQuiz({
  id: "quiz-caesar",
  topicId: "topic-caesar",
  questions: [
    {
      id: "question-rubicon",
      question: "¿Qué río cruzó César en el 49 a.C.?",
      options: ["Tíber", "Rubicón", "Po"],
      correctOptionIndex: 1,
      explanation: "El Rubicón marcaba la frontera de Italia.",
    },
    {
      id: "question-pharsalus",
      question: "¿A quién derrotó César en Farsalia?",
      options: ["Craso", "Pompeyo"],
      correctOptionIndex: 1,
    },
  ],
});

const VISITOR = "visitante-1";
const fixedClock: Clock = { now: () => new Date("2026-10-22T10:00:00Z") };

function createUseCase(answerLimit: number) {
  return new AnswerQuizQuestionUseCase({
    topics: new InMemoryTopicRepository([caesar, pericles]),
    quizzes: new InMemoryQuizRepository([caesarQuiz]),
    rateLimiter: new InMemoryRateLimiter({ limit: answerLimit, windowMs: 60_000 }, fixedClock),
  });
}

// Shared by the functional tests below, with a limit high enough never to be reached.
const useCase = createUseCase(1_000);

const validAnswer = { topicSlug: "julio-cesar", questionId: "question-rubicon", optionIndex: 1 };
const answer = (overrides: Record<string, unknown> = {}) => useCase.execute({ ...validAnswer, ...overrides }, VISITOR);

describe("AnswerQuizQuestionUseCase", () => {
  describe("límite de frecuencia (OWASP API4)", () => {
    it("rechaza las respuestas que superan el límite (frena scripts y abusos)", async () => {
      const limitedUseCase = createUseCase(2);
      await limitedUseCase.execute(validAnswer, VISITOR);
      await limitedUseCase.execute(validAnswer, VISITOR);

      const result = await limitedUseCase.execute(validAnswer, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });

    it("el límite es por visitante", async () => {
      const limitedUseCase = createUseCase(1);
      await limitedUseCase.execute(validAnswer, VISITOR);

      const result = await limitedUseCase.execute(validAnswer, "visitante-2");

      expect(result.success).toBe(true);
    });
  });

  it("indica que la respuesta es correcta y da la explicación", async () => {
    expect(await answer()).toEqual({
      success: true,
      data: { isCorrect: true, correctOptionIndex: 1, explanation: "El Rubicón marcaba la frontera de Italia." },
    });
  });

  it("indica que la respuesta es incorrecta y revela la correcta", async () => {
    expect(await answer({ optionIndex: 0 })).toEqual({
      success: true,
      data: { isCorrect: false, correctOptionIndex: 1, explanation: "El Rubicón marcaba la frontera de Italia." },
    });
  });

  it("devuelve explicación null si la pregunta no la tiene", async () => {
    const result = await answer({ questionId: "question-pharsalus", optionIndex: 1 });

    expect(result.success && result.data.explanation).toBeNull();
  });

  it("devuelve un error de tema no encontrado si el tema no existe", async () => {
    const result = await answer({ topicSlug: "augusto" });

    expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
  });

  it("devuelve un error de pregunta no encontrada si el tema no tiene quiz", async () => {
    const result = await answer({ topicSlug: "pericles" });

    expect(!result.success && result.error).toBeInstanceOf(QuizQuestionNotFoundError);
  });

  it("devuelve un error de pregunta no encontrada si la pregunta no es de ese quiz", async () => {
    const result = await answer({ questionId: "question-inventada" });

    expect(!result.success && result.error).toBeInstanceOf(QuizQuestionNotFoundError);
  });

  it("rechaza una opción que no existe en la pregunta", async () => {
    const result = await answer({ optionIndex: 3 });

    expect(!result.success && result.error).toBeInstanceOf(InvalidQuizAnswerError);
  });

  it.each([
    ["un índice negativo", { optionIndex: -1 }],
    ["un índice decimal", { optionIndex: 0.5 }],
    ["un índice que no es un número", { optionIndex: "1" }],
    ["un slug mal formado", { topicSlug: "../admin" }],
    ["un id de pregunta vacío", { questionId: "" }],
    ["propiedades no permitidas", { score: 100 }],
  ])("rechaza %s", async (_case, overrides) => {
    const result = await answer(overrides);

    expect(!result.success && result.error).toBeInstanceOf(InvalidQuizAnswerError);
  });

  it.each([null, "Rubicón", 1])("rechaza una entrada que no es un objeto: %j", async (input) => {
    const result = await useCase.execute(input, VISITOR);

    expect(!result.success && result.error).toBeInstanceOf(InvalidQuizAnswerError);
  });
});
