import type { AuthenticatedUser, AuthService } from "../ports/AuthService";
import type { UserRoleRepository } from "../ports/UserRoleRepository";

// Lo que sabe la interfaz del usuario con sesión. `isAdmin` solo decide si se muestra el enlace al panel;
// los casos de uso de administración vuelven a comprobar el rol por su cuenta.
export interface CurrentUser extends AuthenticatedUser {
  isAdmin: boolean;
}

// Quién ha iniciado sesión en esta petición, o null para un visitante anónimo.
export class GetCurrentUserUseCase {
  constructor(private readonly dependencies: { auth: AuthService; roles: UserRoleRepository }) {}

  async execute(): Promise<CurrentUser | null> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) return null;

    return { ...user, isAdmin: (await this.dependencies.roles.getRole(user.id)) === "ADMIN" };
  }
}
