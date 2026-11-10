import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export interface LlmConfig {
  baseURL: string;
  model: string;
  apiKey?: string;
  timeoutMs: number;
}

// Any server that speaks the OpenAI protocol: Ollama in development and, by changing LLM_BASE_URL,
// LLM_MODEL and LLM_API_KEY, a free API such as Groq or Gemini once deployed.
export function createLanguageModel({ baseURL, apiKey, model }: LlmConfig): LanguageModel {
  return createOpenAICompatible({ name: "llm", baseURL, apiKey, supportsStructuredOutputs: true }).chatModel(model);
}

// Removes what could close a prompt's tag or attribute, so a text stays inside its delimiters (OWASP LLM01).
export function plainPromptText(text: string): string {
  return text.replace(/[<>]/g, " ").replace(/"/g, "'");
}
