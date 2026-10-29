import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AuthEnv } from "@/composition/env";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/domain/value-objects/Password";
import type { Database } from "../persistence/postgres/client";
import { accounts, sessions, users, verifications } from "../persistence/postgres/schema";

// Better Auth configuration. Users, sessions and accounts live in our PostgreSQL (Drizzle tables with
// plural names). Defaults kept on purpose: scrypt password hashing, httpOnly + SameSite=Lax session
// cookies (Secure over https), 7-day sessions refreshed daily.
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
      // Same rule as the domain (OWASP ASVS), enforced here too in case Better Auth is ever called directly.
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      autoSignIn: true,
    },
    // Off by default already; explicit so nobody wonders whether usage data leaves the server.
    telemetry: { enabled: false },
  });
}

export type BetterAuth = ReturnType<typeof createBetterAuth>;
