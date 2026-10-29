import { isAPIError } from "better-auth/api";
import type { AuthenticatedUser, AuthService, RegistrationResult, SignInResult } from "@/application/ports/AuthService";
import type { DisplayName } from "@/domain/value-objects/DisplayName";
import type { Email } from "@/domain/value-objects/Email";
import type { BetterAuth } from "./createBetterAuth";
import type { SessionCookies } from "./SessionCookies";

const EMAIL_TAKEN_CODES = new Set(["USER_ALREADY_EXISTS", "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"]);
const INVALID_CREDENTIALS_CODES = new Set(["INVALID_EMAIL_OR_PASSWORD"]);

// AuthService on top of Better Auth. Only the expected failures (email taken, wrong credentials) are
// translated; anything else is a real error and propagates.
export class BetterAuthService implements AuthService {
  constructor(
    private readonly auth: BetterAuth,
    private readonly cookies: SessionCookies,
  ) {}

  async register(input: { name: DisplayName; email: Email; password: string }): Promise<RegistrationResult> {
    try {
      const { headers, response } = await this.auth.api.signUpEmail({
        body: { name: input.name, email: input.email, password: input.password },
        headers: await this.cookies.toHeaders(),
        returnHeaders: true,
      });
      await this.cookies.apply(headers);
      return { ok: true, user: toAuthenticatedUser(response.user) };
    } catch (error) {
      if (hasCode(error, EMAIL_TAKEN_CODES)) {
        return { ok: false, reason: "EMAIL_ALREADY_REGISTERED" };
      }
      throw error;
    }
  }

  async signIn(input: { email: Email; password: string }): Promise<SignInResult> {
    try {
      const { headers, response } = await this.auth.api.signInEmail({
        body: { email: input.email, password: input.password },
        headers: await this.cookies.toHeaders(),
        returnHeaders: true,
      });
      await this.cookies.apply(headers);
      return { ok: true, user: toAuthenticatedUser(response.user) };
    } catch (error) {
      if (hasCode(error, INVALID_CREDENTIALS_CODES)) {
        return { ok: false, reason: "INVALID_CREDENTIALS" };
      }
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const { headers } = await this.auth.api.signOut({
      headers: await this.cookies.toHeaders(),
      returnHeaders: true,
    });
    await this.cookies.apply(headers);
  }

  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const session = await this.auth.api.getSession({ headers: await this.cookies.toHeaders() });
    return session ? toAuthenticatedUser(session.user) : null;
  }
}

// Allowlist: the rest of the app never sees the email or anything else Better Auth knows.
function toAuthenticatedUser(user: { id: string; name: string }): AuthenticatedUser {
  return { id: user.id, name: user.name };
}

function hasCode(error: unknown, codes: Set<string>): boolean {
  if (!isAPIError(error)) return false;
  const body: unknown = error.body;
  const code = typeof body === "object" && body !== null && "code" in body ? body.code : undefined;
  return typeof code === "string" && codes.has(code);
}
