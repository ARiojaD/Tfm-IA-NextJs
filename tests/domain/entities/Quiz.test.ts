import { describe, expect, it } from "vitest";
import { QuizSchema } from "@/domain/entities/Quiz";

const validQuestion = {
  id: "q-1",
  question: "¿Qué río cruzó César en el 49 a.C., desencadenando la guerra civil?",
  options: ["Tíber", "Rubicón", "Po"],
  correctOptionIndex: 1,
  explanation: "Cruzar el Rubicón con sus legiones era ilegal y equivalía a declarar la guerra al Senado.",
};

const validQuiz = {
  id: "quiz-julius-caesar",
  topicId: "topic-julius-caesar",
  questions: [validQuestion],
};

const withQuestion = (overrides: Record<string, unknown>) => ({
  ...validQuiz,
  questions: [{ ...validQuestion, ...overrides }],
});

describe("QuizSchema", () => {
  it("acepta un quiz válido", () => {
    const result = QuizSchema.safeParse(validQuiz);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validQuiz);
  });

  it("acepta una pregunta sin explicación", () => {
    const questionWithoutExplanation: Partial<typeof validQuestion> = { ...validQuestion };
    delete questionWithoutExplanation.explanation;

    expect(QuizSchema.safeParse({ ...validQuiz, questions: [questionWithoutExplanation] }).success).toBe(true);
  });

  it("rechaza un quiz sin preguntas", () => {
    expect(QuizSchema.safeParse({ ...validQuiz, questions: [] }).success).toBe(false);
  });

  it("rechaza un quiz sin tema asociado", () => {
    expect(QuizSchema.safeParse({ ...validQuiz, topicId: "" }).success).toBe(false);
  });

  it("rechaza una pregunta vacía", () => {
    expect(QuizSchema.safeParse(withQuestion({ question: " " })).success).toBe(false);
  });

  it("rechaza una pregunta con menos de dos opciones", () => {
    expect(QuizSchema.safeParse(withQuestion({ options: ["Rubicón"], correctOptionIndex: 0 })).success).toBe(false);
  });

  it("rechaza opciones repetidas", () => {
    expect(QuizSchema.safeParse(withQuestion({ options: ["Rubicón", "Rubicón"] })).success).toBe(false);
  });

  it("rechaza una respuesta correcta que no existe entre las opciones", () => {
    expect(QuizSchema.safeParse(withQuestion({ correctOptionIndex: 3 })).success).toBe(false);
  });

  it("rechaza un índice de respuesta negativo", () => {
    expect(QuizSchema.safeParse(withQuestion({ correctOptionIndex: -1 })).success).toBe(false);
  });

  it("rechaza propiedades no permitidas", () => {
    expect(QuizSchema.safeParse({ ...validQuiz, score: 100 }).success).toBe(false);
  });
});
