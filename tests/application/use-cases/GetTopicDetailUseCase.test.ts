import { describe, expect, it } from "vitest";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import { GetTopicDetailUseCase } from "@/application/use-cases/GetTopicDetailUseCase";
import type { Comment } from "@/domain/entities/Comment";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Quiz } from "@/domain/entities/Quiz";
import type { Recommendation } from "@/domain/entities/Recommendation";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { aComment, anEvent, aQuiz, aRecommendation, aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César" });
const pericles = aTopic({ id: "topic-pericles", slug: "pericles", title: "Pericles", era: "ANCIENT_GREECE" });

function createUseCase(data: {
  topics?: HistoricalTopic[];
  events?: HistoricalEvent[];
  quizzes?: Quiz[];
  comments?: Comment[];
  recommendations?: Recommendation[];
}) {
  return new GetTopicDetailUseCase({
    topics: new InMemoryTopicRepository(data.topics ?? [caesar, pericles]),
    events: new InMemoryHistoricalEventRepository(data.events),
    quizzes: new InMemoryQuizRepository(data.quizzes),
    comments: new InMemoryCommentRepository(data.comments),
    recommendations: new InMemoryRecommendationRepository(data.recommendations),
  });
}

describe("GetTopicDetailUseCase", () => {
  it("devuelve el tema con todos sus módulos", async () => {
    const event = anEvent({ id: "event-rubicon", topicId: "topic-caesar" });
    const quiz = aQuiz({ id: "quiz-caesar", topicId: "topic-caesar" });
    const comment = aComment({ id: "comment-1", topicId: "topic-caesar" });
    const recommendation = aRecommendation({ id: "rec-1", topicId: "topic-caesar" });
    const useCase = createUseCase({
      events: [event],
      quizzes: [quiz],
      comments: [comment],
      recommendations: [recommendation],
    });

    const result = await useCase.execute("julio-cesar");

    const publicQuiz = {
      id: "quiz-caesar",
      topicId: "topic-caesar",
      questions: quiz.questions.map(({ id, question, options }) => ({ id, question, options })),
    };
    expect(result).toEqual({
      success: true,
      data: { topic: caesar, events: [event], quiz: publicQuiz, comments: [comment], recommendations: [recommendation] },
    });
  });

  it("no expone las respuestas correctas ni las explicaciones del quiz", async () => {
    const quiz = aQuiz({
      topicId: "topic-caesar",
      questions: [
        {
          id: "question-1",
          question: "¿Qué río cruzó César?",
          options: ["Tíber", "Rubicón"],
          correctOptionIndex: 1,
          explanation: "Era la frontera de Italia.",
        },
      ],
    });

    const result = await createUseCase({ quizzes: [quiz] }).execute("julio-cesar");

    const [question] = (result.success && result.data.quiz?.questions) || [];
    expect(question).toEqual({ id: "question-1", question: "¿Qué río cruzó César?", options: ["Tíber", "Rubicón"] });
    expect(question).not.toHaveProperty("correctOptionIndex");
    expect(question).not.toHaveProperty("explanation");
  });

  it("no mezcla datos de otros temas", async () => {
    const useCase = createUseCase({
      events: [anEvent({ id: "event-caesar", topicId: "topic-caesar" }), anEvent({ id: "event-pericles", topicId: "topic-pericles" })],
      quizzes: [aQuiz({ id: "quiz-pericles", topicId: "topic-pericles" })],
      comments: [aComment({ id: "comment-pericles", topicId: "topic-pericles" })],
      recommendations: [aRecommendation({ id: "rec-pericles", topicId: "topic-pericles" })],
    });

    const result = await useCase.execute("julio-cesar");

    expect(result.success && result.data.events.map((event) => event.id)).toEqual(["event-caesar"]);
    expect(result.success && result.data.quiz).toBeNull();
    expect(result.success && result.data.comments).toEqual([]);
    expect(result.success && result.data.recommendations).toEqual([]);
  });

  it("ordena los eventos cronológicamente", async () => {
    const useCase = createUseCase({
      events: [
        anEvent({ id: "ides-of-march", topicId: "topic-caesar", date: { year: -44, month: 3 } }),
        anEvent({ id: "birth", topicId: "topic-caesar", date: { year: -100, month: 7 } }),
        anEvent({ id: "dictator", topicId: "topic-caesar", date: { year: -44, month: 2 } }),
        anEvent({ id: "rubicon", topicId: "topic-caesar", date: { year: -49, month: 1 } }),
      ],
    });

    const result = await useCase.execute("julio-cesar");

    expect(result.success && result.data.events.map((event) => event.id)).toEqual([
      "birth",
      "rubicon",
      "dictator",
      "ides-of-march",
    ]);
  });

  it("ordena los comentarios del más reciente al más antiguo", async () => {
    const useCase = createUseCase({
      comments: [
        aComment({ id: "monday", topicId: "topic-caesar", createdAt: new Date("2026-10-19T10:00:00Z") }),
        aComment({ id: "wednesday", topicId: "topic-caesar", createdAt: new Date("2026-10-21T10:00:00Z") }),
        aComment({ id: "tuesday", topicId: "topic-caesar", createdAt: new Date("2026-10-20T10:00:00Z") }),
      ],
    });

    const result = await useCase.execute("julio-cesar");

    expect(result.success && result.data.comments.map((comment) => comment.id)).toEqual([
      "wednesday",
      "tuesday",
      "monday",
    ]);
  });

  it("ordena las recomendaciones por tipo (libros, películas, series) y después por año", async () => {
    const useCase = createUseCase({
      recommendations: [
        aRecommendation({ id: "series-2005", topicId: "topic-caesar", type: "SERIES", year: 2005 }),
        aRecommendation({ id: "film-1963", topicId: "topic-caesar", type: "FILM", year: 1963 }),
        aRecommendation({ id: "book-2006", topicId: "topic-caesar", type: "BOOK", year: 2006 }),
        aRecommendation({ id: "film-1953", topicId: "topic-caesar", type: "FILM", year: 1953 }),
        aRecommendation({ id: "book-1599", topicId: "topic-caesar", type: "BOOK", year: 1599 }),
      ],
    });

    const result = await useCase.execute("julio-cesar");

    expect(result.success && result.data.recommendations.map((recommendation) => recommendation.id)).toEqual([
      "book-1599",
      "book-2006",
      "film-1953",
      "film-1963",
      "series-2005",
    ]);
  });

  it("devuelve un error de tema no encontrado si el slug no existe", async () => {
    const result = await createUseCase({}).execute("augusto");

    expect(result.success).toBe(false);
    expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
  });

  it.each(["Julio César", "../admin", ""])(
    "devuelve un error de tema no encontrado si el slug no es válido: %j",
    async (slug) => {
      const result = await createUseCase({}).execute(slug);

      expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
    },
  );
});
