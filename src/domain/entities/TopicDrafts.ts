import { z } from "zod";
import type { KeyFact } from "../value-objects/KeyFact";

// What the language model may propose for a topic's timeline and quiz, always from the topic's own text.
// A proposal is only a draft: it fills the editor's form, and an administrator reviews and saves it.
export const MAX_DRAFT_EVENTS = 8;
export const MAX_DRAFT_QUESTIONS = 5;

// OWASP LLM02: the limits match the editor's, so a draft can always be saved once reviewed.
export const GeneratedEventsSchema = z.strictObject({
  events: z
    .array(
      z.strictObject({
        title: z.string().trim().min(1).max(120),
        // Year and era apart: a model gets negative years wrong far more often.
        year: z.number().int().min(1).max(3000),
        era: z.enum(["BC", "AD"]),
        // 0 when the text does not say the month.
        month: z.number().int().min(0).max(12),
        description: z.string().trim().min(1).max(1000),
      }),
    )
    .max(MAX_DRAFT_EVENTS),
});

export const GeneratedQuizSchema = z.strictObject({
  questions: z
    .array(
      z.strictObject({
        question: z.string().trim().min(1).max(300),
        options: z.array(z.string().trim().min(1).max(150)).min(2).max(4),
        correctOptionIndex: z.number().int().min(0),
        explanation: z.string().trim().max(500),
      }),
    )
    .max(MAX_DRAFT_QUESTIONS),
});

export type GeneratedEvents = z.infer<typeof GeneratedEventsSchema>;
export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>;

// The rows of the editor's forms, where every date field is text. An empty id means a new row.
export interface EventDraftRow {
  id: "";
  title: string;
  year: string;
  era: "BC" | "AD";
  month: string;
  description: string;
}

export interface QuestionDraftRow {
  id: "";
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

// All the model can read about a topic: what the administrator wrote in it.
export function topicSourceText({ introduction, keyFacts }: { introduction: string[]; keyFacts: KeyFact[] }): string {
  return [...introduction, ...keyFacts.map((fact) => `${fact.label}: ${fact.value}`)].join("\n");
}

// A check that does not depend on the model: a year that is not in the text was invented.
export function eventDraftRows({ events }: GeneratedEvents, sourceText: string): EventDraftRow[] {
  return events
    .filter((event) => new RegExp(`(?<!\\d)${event.year}(?!\\d)`).test(sourceText))
    .map(({ title, year, era, month, description }) => ({
      id: "",
      title,
      year: String(year),
      era,
      month: month === 0 ? "" : String(month),
      description,
    }));
}

// Drops what the quiz could not hold. Models tend to write the correct answer first, so each question is
// rotated by its position: the answer moves and stays marked.
export function quizDraftRows({ questions }: GeneratedQuiz): QuestionDraftRow[] {
  return questions
    .filter(({ options, correctOptionIndex }) => new Set(options).size === options.length && correctOptionIndex < options.length)
    .map(({ question, options, correctOptionIndex, explanation }, position) => {
      const shift = position % options.length;
      return {
        id: "",
        question,
        options: options.map((_, index) => options[(index - shift + options.length) % options.length]),
        correctOptionIndex: (correctOptionIndex + shift) % options.length,
        explanation,
      };
    });
}
