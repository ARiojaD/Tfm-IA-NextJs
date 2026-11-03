import { failure, success, type Result } from "@/shared/Result";
import { AdminRequiredError } from "../errors/AdminRequiredError";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import type { AuthenticatedUser, AuthService } from "../ports/AuthService";
import type { RateLimiter } from "../ports/RateLimiter";
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

export interface AdminWriteDependencies extends AdminAuthorizationDependencies {
  rateLimiter: RateLimiter;
}

export type AdminWriteError = AdminAuthorizationError | RateLimitExceededError;

// For the admin use cases that change data: authorized first, then rate-limited per admin (OWASP API4),
// before validating, so every attempt counts.
export async function authorizeAdminWrite(
  dependencies: AdminWriteDependencies,
): Promise<Result<AuthenticatedUser, AdminWriteError>> {
  const access = await authorizeAdmin(dependencies);
  if (!access.success) return access;

  const decision = await dependencies.rateLimiter.consume(`user:${access.data.id}`);
  if (!decision.allowed) {
    return failure(new RateLimitExceededError(decision.retryAfterSeconds));
  }
  return access;
}
