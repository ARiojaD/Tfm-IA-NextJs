import type { AuthenticatedUser, AuthService } from "../ports/AuthService";

// Who is signed in for this request, or null for an anonymous visitor.
export class GetCurrentUserUseCase {
  constructor(private readonly dependencies: { auth: AuthService }) {}

  execute(): Promise<AuthenticatedUser | null> {
    return this.dependencies.auth.getCurrentUser();
  }
}
