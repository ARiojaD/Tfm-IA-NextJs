import type { LanguageModel } from "ai";
import type { AnswerGenerator, AnswerSource } from "@/application/ports/AnswerGenerator";
import { type GeneratedAnswer, GeneratedAnswerSchema } from "@/domain/entities/EncyclopediaAnswer";
import { buildAnswerPrompt } from "./answerPrompt";
import { createLanguageModel, generateStructured, type LlmConfig } from "./languageModel";

// Un tope a lo que puede costar una respuesta (OWASP LLM10).
const MAX_OUTPUT_TOKENS = 700;

// Redacta las respuestas del RAG con el modelo de lenguaje configurado.
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
