import type { DisplayName } from "@/domain/value-objects/DisplayName";
import type { Email } from "@/domain/value-objects/Email";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Who is signed in, as the rest of the app sees it: only what it needs. Never the email or the password.
export interface AuthenticatedUser {
  id: EntityId;
  name: DisplayName;
}

export type RegistrationResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; reason: "EMAIL_ALREADY_REGISTERED" };

// A wrong password and an unknown email give the same answer, so nobody can learn which emails exist.
export type SignInResult = { ok: true; user: AuthenticatedUser } | { ok: false; reason: "INVALID_CREDENTIALS" };

// Accounts and sessions. The use cases validate the input before calling it; the implementation stores
// the password hashed and keeps the session for the current request (a cookie, in the real one).
export interface AuthService {
  // Creates the account and signs the user in.
  register(input: { name: DisplayName; email: Email; password: string }): Promise<RegistrationResult>;
  signIn(input: { email: Email; password: string }): Promise<SignInResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthenticatedUser | null>;
}
