import { z } from "zod";

// Lo que debe devolver el modelo de lenguaje (OWASP LLM02: salida estructurada y validada antes de usarla).
// FULL: los fragmentos responden a la pregunta. PARTIAL: solo en parte, y `missing` dice lo que falta.
// NONE: no la responden.
export const ANSWER_COVERAGES = ["FULL", "PARTIAL", "NONE"] as const;

export const GeneratedAnswerSchema = z.strictObject({
  coverage: z.enum(ANSWER_COVERAGES),
  answer: z.string().trim().max(3000),
  missing: z.string().trim().max(500),
});

export type GeneratedAnswer = z.infer<typeof GeneratedAnswerSchema>;

// La respuesta en piezas simples: la interfaz pinta texto y enlaces a las fuentes, y nunca tiene que
// interpretar (ni inyectar como HTML) lo que escribió un modelo.
export type AnswerPart = { type: "text"; text: string } | { type: "citation"; number: number };

const CITATION = /\s*\[(\d+(?:\s*,\s*\d+)*)\]/g;

// Lee los [1], [2] del texto del modelo. Solo cuentan los números de fuentes que de verdad recibió: una
// cita inventada desaparece. Las fuentes citadas se renumeran 1, 2… por orden de aparición; `citedSources`
// conserva los números originales para que quien llama pueda encontrarlas.
export function parseCitations(text: string, sourceCount: number): { parts: AnswerPart[]; citedSources: number[] } {
  const parts: AnswerPart[] = [];
  const citedSources: number[] = [];
  let pendingText = "";
  let position = 0;

  const flushText = () => {
    if (pendingText) parts.push({ type: "text", text: pendingText });
    pendingText = "";
  };

  for (const match of text.matchAll(CITATION)) {
    pendingText += text.slice(position, match.index);
    position = match.index + match[0].length;

    const numbers = match[1]
      .split(",")
      .map(Number)
      .filter((number) => number >= 1 && number <= sourceCount);
    if (numbers.length === 0) continue;

    flushText();
    for (const number of numbers) {
      if (!citedSources.includes(number)) citedSources.push(number);
      parts.push({ type: "citation", number: citedSources.indexOf(number) + 1 });
    }
  }
  pendingText += text.slice(position);
  flushText();

  return { parts, citedSources };
}
