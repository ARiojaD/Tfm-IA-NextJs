import { failure, success, type Result } from "@/shared/Result";
import { AdminRequiredError } from "../errors/AdminRequiredError";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import type { AuthenticatedUser, AuthService } from "../ports/AuthService";
import type { UserRoleRepository } from "../ports/UserRoleRepository";

export interface AdminAuthorizationDependencies {
  auth: AuthService;
  roles: UserRoleRepository;
}

export type AdminAuthorizationError = AuthenticationRequiredError | AdminRequiredError;

// The first step of every admin use case: a session, and the ADMIN role read from the database right now
// (never from the session cookie or the form), so revoking it applies on the next request.
export async function authorizeAdmin({
  auth,
  roles,
}: AdminAuthorizationDependencies): Promise<Result<AuthenticatedUser, AdminAuthorizationError>> {
  const user = await auth.getCurrentUser();
  if (!user) {
    return failure(new AuthenticationRequiredError("entrar en el panel de administración"));
  }
  if ((await roles.getRole(user.id)) !== "ADMIN") {
    return failure(new AdminRequiredError());
  }
  return success(user);
}
