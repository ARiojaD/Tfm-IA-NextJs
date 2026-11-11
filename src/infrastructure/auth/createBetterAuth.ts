import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AuthEnv } from "@/composition/env";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/domain/value-objects/Password";
import type { Database } from "../persistence/postgres/client";
import { accounts, sessions, users, verifications } from "../persistence/postgres/schema";

// Configuración de Better Auth. Los usuarios, las sesiones y las cuentas viven en nuestro PostgreSQL
// (tablas de Drizzle con nombres en plural). Se mantienen a propósito los valores por defecto: hash de
// contraseñas con scrypt, cookies de sesión httpOnly + SameSite=Lax (Secure con https) y sesiones de 7
// días que se renuevan cada día.
export function createBetterAuth(db: Database, env: AuthEnv) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { users, sessions, accounts, verifications },
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
      // La misma regla que el dominio (OWASP ASVS), exigida también aquí por si alguna vez se llama a
      // Better Auth directamente.
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      autoSignIn: true,
    },
    // Ya viene desactivado por defecto; se pone explícito para que nadie dude de si salen datos de uso
    // del servidor.
    telemetry: { enabled: false },
  });
}

export type BetterAuth = ReturnType<typeof createBetterAuth>;
