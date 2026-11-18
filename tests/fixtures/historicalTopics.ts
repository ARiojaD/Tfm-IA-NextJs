import type { Comment } from "@/domain/entities/Comment";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Quiz } from "@/domain/entities/Quiz";
import type { Recommendation } from "@/domain/entities/Recommendation";

// Constructores de datos de prueba: valores válidos por defecto que cada test cambia solo donde importa.

export function aTopic(overrides: Partial<HistoricalTopic> = {}): HistoricalTopic {
  return {
    id: "topic-1",
    slug: "tema-de-prueba",
    title: "Tema de prueba",
    era: "ROMAN",
    category: "PEOPLE",
    summary: "Resumen del tema de prueba.",
    period: { start: { year: -100 } },
    introduction: ["Introducción del tema de prueba."],
    keyFacts: [{ label: "Dato", value: "Valor del dato de prueba" }],
    relatedTopicIds: [],
    status: "PUBLISHED",
    ...overrides,
  };
}

export function anEvent(overrides: Partial<HistoricalEvent> = {}): HistoricalEvent {
  return {
    id: "event-1",
    topicId: "topic-1",
    title: "Evento de prueba",
    date: { year: -49, month: 1 },
    era: "ROMAN",
    description: "Descripción del evento de prueba.",
    ...overrides,
  };
}

export function aQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: "quiz-1",
    topicId: "topic-1",
    questions: [
      {
        id: "question-1",
        question: "¿Pregunta de prueba?",
        options: ["Opción A", "Opción B"],
        correctOptionIndex: 0,
      },
    ],
    ...overrides,
  };
}

export function aComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "comment-1",
    topicId: "topic-1",
    author: "Livia",
    message: "Comentario de prueba.",
    createdAt: new Date("2026-10-19T10:00:00Z"),
    ...overrides,
  };
}

export function aRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: "recommendation-1",
    topicId: "topic-1",
    type: "BOOK",
    title: "Libro de prueba",
    creator: "Autor de prueba",
    year: 2000,
    description: "Descripción de la recomendación de prueba.",
    ...overrides,
  };
}
