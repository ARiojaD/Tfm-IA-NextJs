import { z } from "zod";

// What the language model must return (OWASP LLM02: structured output, validated before it is used).
// FULL: the fragments answer the question. PARTIAL: only in part, and `missing` says what is not there.
// NONE: they do not answer it.
export const ANSWER_COVERAGES = ["FULL", "PARTIAL", "NONE"] as const;

export const GeneratedAnswerSchema = z.strictObject({
  coverage: z.enum(ANSWER_COVERAGES),
  answer: z.string().trim().max(3000),
  missing: z.string().trim().max(500),
});

export type GeneratedAnswer = z.infer<typeof GeneratedAnswerSchema>;

// The answer as plain pieces: the interface renders text and links to sources, and never has to interpret
// (or inject as HTML) what a model wrote.
export type AnswerPart = { type: "text"; text: string } | { type: "citation"; number: number };

const CITATION = /\s*\[(\d+(?:\s*,\s*\d+)*)\]/g;

// Reads the [1], [2] of the model's text. Only numbers of sources it was actually given count: an invented
// one disappears. The cited sources are renumbered 1, 2… in order of appearance; `citedSources` keeps the
// original numbers, so the caller can find them.
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
