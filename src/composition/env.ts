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

export type DatabaseEnv = z.infer<typeof DatabaseEnvSchema>;
export type AuthEnv = z.infer<typeof AuthEnvSchema>;

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

function parseWith<Schema extends z.ZodObject>(schema: Schema, source: Source): z.infer<Schema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new InvalidEnvironmentError(variables);
  }
  return result.data;
}
