import type { EntityId } from "@/domain/value-objects/EntityId";
import type { UserRole } from "@/domain/value-objects/UserRole";

// The role of each account, read on every request: granting or revoking ADMIN applies at once, without
// waiting for the session to expire. Kept apart from AuthService, which only knows who is signed in.
export interface UserRoleRepository {
  // An unknown account is a USER: when in doubt, never ADMIN.
  getRole(userId: EntityId): Promise<UserRole>;
  setRole(userId: EntityId, role: UserRole): Promise<void>;
}
