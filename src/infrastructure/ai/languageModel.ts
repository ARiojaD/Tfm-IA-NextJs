import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, type LanguageModel, Output } from "ai";
import type { z } from "zod";

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

// One structured call to the model. Output.object asks for the JSON schema and validates the reply with it;
// anything else rejects (OWASP LLM02). A failure is logged by its type only: the message of a validation
// error can carry the model's reply or the user's text (OWASP LLM06).
export async function generateStructured<Schema extends z.ZodType<object>>(
  model: LanguageModel,
  config: LlmConfig,
  request: { system: string; prompt: string; schema: Schema; name: string; maxOutputTokens: number },
): Promise<z.output<Schema>> {
  const { system, prompt, schema, name, maxOutputTokens } = request;
  try {
    const { output } = await generateText({
      model,
      system,
      prompt,
      output: Output.object({ schema, name }),
      temperature: 0.1,
      maxOutputTokens,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(config.timeoutMs),
    });
    return output as z.output<Schema>;
  } catch (error) {
    console.error(`Ha fallado el modelo de lenguaje (${name}): ${error instanceof Error ? error.name : "error desconocido"}`);
    throw error;
  }
}
