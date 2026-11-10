import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, type LanguageModel, Output } from "ai";
import type { AnswerGenerator, AnswerSource } from "@/application/ports/AnswerGenerator";
import { type GeneratedAnswer, GeneratedAnswerSchema } from "@/domain/entities/EncyclopediaAnswer";
import { buildAnswerPrompt } from "./answerPrompt";

export interface LlmConfig {
  baseURL: string;
  model: string;
  apiKey?: string;
  timeoutMs: number;
}

// A bound on what one answer can cost (OWASP LLM10).
const MAX_OUTPUT_TOKENS = 700;

// Writes the answers with any server that speaks the OpenAI protocol: Ollama in development and, by changing
// LLM_BASE_URL, LLM_MODEL and LLM_API_KEY, a free API such as Groq or Gemini once deployed.
export class OpenAiCompatibleAnswerGenerator implements AnswerGenerator {
  private readonly model: LanguageModel;

  constructor(private readonly config: LlmConfig) {
    this.model = createOpenAICompatible({
      name: "llm",
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      supportsStructuredOutputs: true,
    }).chatModel(config.model);
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
