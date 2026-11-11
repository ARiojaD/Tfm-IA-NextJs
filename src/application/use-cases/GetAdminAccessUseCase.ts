import type { Result } from "@/shared/Result";
import type { AuthenticatedUser } from "../ports/AuthService";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// Permite a las páginas de administración decidir qué mostrar: el panel, el inicio de sesión o un 404 para
// quien no es administrador. Los casos de uso de administración siguen comprobándolo por su cuenta: esto
// no es la protección, solo la respuesta de la página.
export class GetAdminAccessUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies) {}

  execute(): Promise<Result<AuthenticatedUser, AdminAuthorizationError>> {
    return authorizeAdmin(this.dependencies);
  }
}
