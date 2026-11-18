import { z } from "zod";
import { REASONING_EFFORTS } from "@/infrastructure/ai/reasoningEffort";

// La configuración del servidor, validada la primera vez que se usa (OWASP A05): una variable que falta o
// está mal formada detiene la aplicación con un mensaje claro, en lugar de fallar más tarde de forma
// confusa. Cada grupo se valida donde se necesita, así los scripts de base de datos (migraciones, seed,
// tests) no exigen el secreto de autenticación. Solo se conservan las variables declaradas; el resto de
// `process.env` se ignora.

export const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export const AuthEnvSchema = z.object({
  // Firma las cookies de sesión y los tokens: mucha entropía, al menos 32 caracteres (se genera con
  // `npm run auth:secret`).
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
});

// El modelo de lenguaje del RAG: cualquier servidor que hable el protocolo de OpenAI. Los valores por
// defecto son un Ollama local; una vez desplegado apuntan a una API gratuita, que es el único caso que
// necesita clave.
export const LlmEnvSchema = z.object({
  LLM_BASE_URL: z.url({ protocol: /^https?$/ }).default("http://127.0.0.1:11434/v1"),
  LLM_MODEL: z.string().trim().min(1).default("qwen2.5:7b"),
  LLM_API_KEY: z.string().trim().min(1).optional(),
  // Solo para los modelos que razonan antes de responder (gpt-oss en Groq): cuánto pensar. Sin la variable
  // no se envía nada, que es lo que espera Ollama.
  LLM_REASONING_EFFORT: z.enum(REASONING_EFFORTS).optional(),
  // Tope diario de llamadas a la IA para toda la web (preguntas y propuestas con IA juntas). Por defecto,
  // 50: por debajo del cupo diario de tokens del plan gratuito de Groq.
  LLM_DAILY_LIMIT: z.coerce.number().int().positive().max(100_000).default(50),
});

export type DatabaseEnv = z.infer<typeof DatabaseEnvSchema>;
export type AuthEnv = z.infer<typeof AuthEnvSchema>;
export type LlmEnv = z.infer<typeof LlmEnvSchema>;

// Nombra las variables que fallaron y por qué, nunca sus valores: llevan contraseñas y secretos.
export class InvalidEnvironmentError extends Error {
  constructor(public readonly variables: string[]) {
    super(
      `Variables de entorno ausentes o no válidas: ${variables.join(", ")}. Revisa .env.local (plantilla en .env.example).`,
    );
    this.name = "InvalidEnvironmentError";
  }
}

type Source = Record<string, string | undefined>;

export function parseDatabaseEnv(source: Source): DatabaseEnv {
  return parseWith(DatabaseEnvSchema, source);
}

export function parseAuthEnv(source: Source): AuthEnv {
  return parseWith(AuthEnvSchema, source);
}

export function parseLlmEnv(source: Source): LlmEnv {
  return parseWith(LlmEnvSchema, source);
}

function parseWith<Schema extends z.ZodObject>(schema: Schema, source: Source): z.infer<Schema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new InvalidEnvironmentError(variables);
  }
  return result.data;
}
