import type { AuthenticatedUser, AuthService } from "../ports/AuthService";
import type { UserRoleRepository } from "../ports/UserRoleRepository";

// What the interface knows about the signed-in user. isAdmin only decides whether to show the panel
// link; the admin use cases check the role again on their own.
export interface CurrentUser extends AuthenticatedUser {
  isAdmin: boolean;
}

// Who is signed in for this request, or null for an anonymous visitor.
export class GetCurrentUserUseCase {
  constructor(private readonly dependencies: { auth: AuthService; roles: UserRoleRepository }) {}

  async execute(): Promise<CurrentUser | null> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) return null;

    return { ...user, isAdmin: (await this.dependencies.roles.getRole(user.id)) === "ADMIN" };
  }
}
