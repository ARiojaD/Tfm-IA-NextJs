import type { AuthService } from "../ports/AuthService";

// Ends the current session. Doing it without a session is not an error.
export class SignOutUseCase {
  constructor(private readonly dependencies: { auth: AuthService }) {}

  execute(): Promise<void> {
    return this.dependencies.auth.signOut();
  }
}
