import { z } from "zod";
import type { KeyFact } from "../value-objects/KeyFact";

// Lo que el modelo de lenguaje puede proponer para la cronología y el quiz de un tema, siempre a partir
// del propio texto del tema. Una propuesta es solo un borrador: rellena el formulario del editor, y un
// administrador la revisa y la guarda.
export const MAX_DRAFT_EVENTS = 8;
export const MAX_DRAFT_QUESTIONS = 5;

// OWASP LLM02: los límites coinciden con los del editor, así que un borrador revisado siempre se puede
// guardar.
export const GeneratedEventsSchema = z.strictObject({
  events: z
    .array(
      z.strictObject({
        title: z.string().trim().min(1).max(120),
        // Año y era por separado: un modelo se equivoca mucho más con los años negativos.
        year: z.number().int().min(1).max(3000),
        era: z.enum(["BC", "AD"]),
        // 0 cuando el texto no dice el mes.
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

// Las filas de los formularios del editor, donde todos los campos de fecha son texto. Un id vacío es una
// fila nueva.
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

// Todo lo que el modelo puede leer de un tema: lo que escribió en él el administrador.
export function topicSourceText({ introduction, keyFacts }: { introduction: string[]; keyFacts: KeyFact[] }): string {
  return [...introduction, ...keyFacts.map((fact) => `${fact.label}: ${fact.value}`)].join("\n");
}

// Una comprobación que no depende del modelo: un año que no está en el texto es inventado.
export function yearAppearsIn(year: number, text: string): boolean {
  return new RegExp(`(?<!\\d)${year}(?!\\d)`).test(text);
}

// Los eventos con un año que no aparece en el texto se descartan (ver `yearAppearsIn`).
export function eventDraftRows({ events }: GeneratedEvents, sourceText: string): EventDraftRow[] {
  return events
    .filter((event) => yearAppearsIn(event.year, sourceText))
    .map(({ title, year, era, month, description }) => ({
      id: "",
      title,
      year: String(year),
      era,
      month: month === 0 ? "" : String(month),
      description,
    }));
}

// Descarta lo que el quiz no podría guardar. Los modelos tienden a escribir la respuesta correcta la
// primera, así que cada pregunta se rota según su posición: la respuesta cambia de sitio y sigue marcada.
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
