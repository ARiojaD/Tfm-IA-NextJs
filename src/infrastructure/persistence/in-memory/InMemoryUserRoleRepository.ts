import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { UserRole } from "@/domain/value-objects/UserRole";

// Roles of the in-memory accounts (unit tests). Accounts never named here are USERs.
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
