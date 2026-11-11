import type { EntityId } from "@/domain/value-objects/EntityId";
import type { UserRole } from "@/domain/value-objects/UserRole";

// El rol de cada cuenta, que se lee en cada petición: conceder o retirar ADMIN se aplica al momento, sin
// esperar a que caduque la sesión. Está separado de `AuthService`, que solo sabe quién ha iniciado sesión.
export interface UserRoleRepository {
  // Una cuenta desconocida es USER: ante la duda, nunca ADMIN.
  getRole(userId: EntityId): Promise<UserRole>;
  setRole(userId: EntityId, role: UserRole): Promise<void>;
}
