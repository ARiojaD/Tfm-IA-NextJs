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

// El primer paso de todo caso de uso de administración: una sesión y el rol ADMIN leído de la base de
// datos en ese momento (nunca de la cookie de sesión ni del formulario), así que retirarlo se aplica en la
// siguiente petición.
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

// Para los casos de uso de administración que cambian datos: primero se autoriza y después se limita por
// administrador (OWASP API4), antes de validar, para que cuenten todos los intentos.
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
