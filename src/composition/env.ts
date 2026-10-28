import { z } from "zod";

// Server configuration, validated once at startup (OWASP A05): a missing or malformed variable stops
// the app with a clear message instead of failing later in an obscure way. Only the declared
// variables are kept; the rest of process.env is ignored.
export const EnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export type Env = z.infer<typeof EnvSchema>;

// Names the variables that failed and why, never their values: DATABASE_URL carries the password.
export class InvalidEnvironmentError extends Error {
  constructor(public readonly variables: string[]) {
    super(
      `Variables de entorno ausentes o no válidas: ${variables.join(", ")}. Revisa .env.local (plantilla en .env.example).`,
    );
    this.name = "InvalidEnvironmentError";
  }
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new InvalidEnvironmentError(variables);
  }
  return result.data;
}
