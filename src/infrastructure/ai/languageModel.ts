import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, type LanguageModel, Output } from "ai";
import type { z } from "zod";
import type { ReasoningEffort } from "./reasoningEffort";

// Un modelo que razona gasta tokens pensando antes de escribir la respuesta, y cuentan dentro del mismo
// tope: sin este margen, la respuesta se cortaría a medias y no sería JSON válido.
const REASONING_TOKEN_ALLOWANCE = 1024;

// La configuración del modelo de lenguaje, que sale de las variables `LLM_*` (ver `composition/container.ts`).
export interface LlmConfig {
  baseURL: string;
  model: string;
  apiKey?: string;
  timeoutMs: number;
  reasoningEffort?: ReasoningEffort;
}

// Cualquier servidor que hable el protocolo de OpenAI: Ollama en desarrollo y, cambiando `LLM_BASE_URL`,
// `LLM_MODEL` y `LLM_API_KEY`, una API gratuita como Groq o Gemini una vez desplegado.
export function createLanguageModel({ baseURL, apiKey, model }: LlmConfig): LanguageModel {
  return createOpenAICompatible({ name: "llm", baseURL, apiKey, supportsStructuredOutputs: true }).chatModel(model);
}

// Quita lo que podría cerrar una etiqueta o un atributo del prompt, para que un texto se quede dentro de
// sus delimitadores (OWASP LLM01).
export function plainPromptText(text: string): string {
  return text.replace(/[<>]/g, " ").replace(/"/g, "'");
}

// Una llamada estructurada al modelo. `Output.object` le pide el esquema JSON y valida la respuesta con
// él; cualquier otra cosa se rechaza (OWASP LLM02). Un fallo se registra solo por su tipo: el mensaje de
// un error de validación puede llevar la respuesta del modelo o el texto del usuario (OWASP LLM06).
// Temperatura baja para que el modelo se ciña a los datos, y sin reintentos para no multiplicar el coste.
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
      maxOutputTokens: maxOutputTokens + (config.reasoningEffort ? REASONING_TOKEN_ALLOWANCE : 0),
      ...(config.reasoningEffort && { providerOptions: { llm: { reasoningEffort: config.reasoningEffort } } }),
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(config.timeoutMs),
    });
    return output as z.output<Schema>;
  } catch (error) {
    console.error(`Ha fallado el modelo de lenguaje (${name}): ${error instanceof Error ? error.name : "error desconocido"}`);
    throw error;
  }
}
