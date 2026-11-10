import type { LanguageModel } from "ai";
import type { AnswerGenerator, AnswerSource } from "@/application/ports/AnswerGenerator";
import { type GeneratedAnswer, GeneratedAnswerSchema } from "@/domain/entities/EncyclopediaAnswer";
import { buildAnswerPrompt } from "./answerPrompt";
import { createLanguageModel, generateStructured, type LlmConfig } from "./languageModel";

// A bound on what one answer can cost (OWASP LLM10).
const MAX_OUTPUT_TOKENS = 700;

// Writes the answers of the RAG with the configured language model.
export class OpenAiCompatibleAnswerGenerator implements AnswerGenerator {
  private readonly model: LanguageModel;

  constructor(private readonly config: LlmConfig) {
    this.model = createLanguageModel(config);
  }

  answer(question: string, sources: AnswerSource[]): Promise<GeneratedAnswer> {
    return generateStructured(this.model, this.config, {
      ...buildAnswerPrompt(question, sources),
      schema: GeneratedAnswerSchema,
      name: "respuesta",
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });
  }
}
