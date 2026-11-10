import { generateText, type LanguageModel, Output } from "ai";
import type { AnswerGenerator, AnswerSource } from "@/application/ports/AnswerGenerator";
import { type GeneratedAnswer, GeneratedAnswerSchema } from "@/domain/entities/EncyclopediaAnswer";
import { buildAnswerPrompt } from "./answerPrompt";
import { createLanguageModel, type LlmConfig } from "./languageModel";

// A bound on what one answer can cost (OWASP LLM10).
const MAX_OUTPUT_TOKENS = 700;

// Writes the answers of the RAG with the configured language model.
export class OpenAiCompatibleAnswerGenerator implements AnswerGenerator {
  private readonly model: LanguageModel;

  constructor(private readonly config: LlmConfig) {
    this.model = createLanguageModel(config);
  }

  // Output.object asks for the JSON schema and validates the reply with it; anything else rejects (OWASP LLM02).
  async answer(question: string, sources: AnswerSource[]): Promise<GeneratedAnswer> {
    const { output } = await generateText({
      model: this.model,
      ...buildAnswerPrompt(question, sources),
      output: Output.object({ schema: GeneratedAnswerSchema, name: "respuesta" }),
      temperature: 0.1,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(this.config.timeoutMs),
    });
    return output;
  }
}
