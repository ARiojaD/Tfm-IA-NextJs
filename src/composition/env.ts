import { z } from "zod";

// Server configuration, validated on first use (OWASP A05): a missing or malformed variable stops the
// app with a clear message instead of failing later in an obscure way. Each group is validated where it
// is needed, so the database scripts (migrations, seed, tests) do not require the auth secret. Only the
// declared variables are kept; the rest of process.env is ignored.

export const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export const AuthEnvSchema = z.object({
  // Signs session cookies and tokens: high entropy, at least 32 characters (generate with npm run auth:secret).
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
});

// The language model of the RAG: any server that speaks the OpenAI protocol. The defaults are a local
// Ollama; once deployed these point to a free API, which is the only case that needs a key.
export const LlmEnvSchema = z.object({
  LLM_BASE_URL: z.url({ protocol: /^https?$/ }).default("http://127.0.0.1:11434/v1"),
  LLM_MODEL: z.string().trim().min(1).default("qwen2.5:7b"),
  LLM_API_KEY: z.string().trim().min(1).optional(),
});

export type DatabaseEnv = z.infer<typeof DatabaseEnvSchema>;
export type AuthEnv = z.infer<typeof AuthEnvSchema>;
export type LlmEnv = z.infer<typeof LlmEnvSchema>;

// Names the variables that failed and why, never their values: they carry passwords and secrets.
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
