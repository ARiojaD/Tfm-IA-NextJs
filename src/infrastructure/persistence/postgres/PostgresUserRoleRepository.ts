import { eq } from "drizzle-orm";
import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";
import type { Email } from "@/domain/value-objects/Email";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { type UserRole, UserRoleSchema } from "@/domain/value-objects/UserRole";
import type { Database } from "./client";
import { users } from "./schema";

export class PostgresUserRoleRepository implements UserRoleRepository {
  constructor(private readonly db: Database) {}

  async getRole(userId: EntityId): Promise<UserRole> {
    const [row] = await this.db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    return row ? UserRoleSchema.parse(row.role) : "USER";
  }

  async setRole(userId: EntityId, role: UserRole): Promise<void> {
    await this.db.update(users).set({ role }).where(eq(users.id, userId));
  }

  // Only for the admin:grant / admin:revoke script, which names the account by its email.
  async findUserIdByEmail(email: Email): Promise<EntityId | null> {
    const [row] = await this.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return row?.id ?? null;
  }
}
