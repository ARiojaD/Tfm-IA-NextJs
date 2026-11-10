import type { GeneratedAnswer } from "@/domain/entities/EncyclopediaAnswer";

// A fragment found for the question, numbered so the model can cite it as [1], [2]…
export interface AnswerSource {
  number: number;
  topicTitle: string;
  section: string;
  content: string;
}

// Writes the answer from the given fragments only. Behind it: Ollama in development, a free API once
// deployed. Rejects if the model is unavailable or does not return a valid answer.
export interface AnswerGenerator {
  answer(question: string, sources: AnswerSource[]): Promise<GeneratedAnswer>;
}
