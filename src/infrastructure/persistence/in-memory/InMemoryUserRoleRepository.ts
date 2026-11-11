import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { UserRole } from "@/domain/value-objects/UserRole";

// Los roles de las cuentas en memoria (tests unitarios). Las cuentas que no aparecen aquí son USER.
export class InMemoryUserRoleRepository implements UserRoleRepository {
  private readonly roles = new Map<EntityId, UserRole>();

  getRole(userId: EntityId): Promise<UserRole> {
    return Promise.resolve(this.roles.get(userId) ?? "USER");
  }

  setRole(userId: EntityId, role: UserRole): Promise<void> {
    this.roles.set(userId, role);
    return Promise.resolve();
  }
}
