import type { AuthService } from "../ports/AuthService";

// Cierra la sesión actual. Hacerlo sin sesión no es un error.
export class SignOutUseCase {
  constructor(private readonly dependencies: { auth: AuthService }) {}

  execute(): Promise<void> {
    return this.dependencies.auth.signOut();
  }
}
