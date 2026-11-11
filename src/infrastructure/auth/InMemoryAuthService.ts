import { randomUUID } from "node:crypto";
import type { AuthenticatedUser, AuthService, RegistrationResult, SignInResult } from "@/application/ports/AuthService";
import type { DisplayName } from "@/domain/value-objects/DisplayName";
import type { Email } from "@/domain/value-objects/Email";

interface StoredAccount {
  user: AuthenticatedUser;
  password: string;
}

// Doble de prueba para los tests unitarios y `createContainer()`: las cuentas y la "sesión actual" viven
// en este objeto. Las contraseñas se guardan tal cual porque aquí nunca se persiste nada; la
// implementación real (`BetterAuthService`) solo guarda un hash scrypt.
export class InMemoryAuthService implements AuthService {
  private readonly accountsByEmail = new Map<Email, StoredAccount>();
  private currentUser: AuthenticatedUser | null = null;

  register(input: { name: DisplayName; email: Email; password: string }): Promise<RegistrationResult> {
    if (this.accountsByEmail.has(input.email)) {
      return Promise.resolve({ ok: false, reason: "EMAIL_ALREADY_REGISTERED" });
    }

    const user = { id: randomUUID(), name: input.name };
    this.accountsByEmail.set(input.email, { user, password: input.password });
    this.currentUser = user;
    return Promise.resolve({ ok: true, user: { ...user } });
  }

  signIn(input: { email: Email; password: string }): Promise<SignInResult> {
    const account = this.accountsByEmail.get(input.email);
    if (!account || account.password !== input.password) {
      return Promise.resolve({ ok: false, reason: "INVALID_CREDENTIALS" });
    }

    this.currentUser = account.user;
    return Promise.resolve({ ok: true, user: { ...account.user } });
  }

  signOut(): Promise<void> {
    this.currentUser = null;
    return Promise.resolve();
  }

  getCurrentUser(): Promise<AuthenticatedUser | null> {
    return Promise.resolve(this.currentUser && { ...this.currentUser });
  }
}
