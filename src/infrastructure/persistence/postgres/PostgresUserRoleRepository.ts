import { eq } from "drizzle-orm";
import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";
import type { Email } from "@/domain/value-objects/Email";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { type UserRole, UserRoleSchema } from "@/domain/value-objects/UserRole";
import type { Database } from "./client";
import { users } from "./schema";

// El rol se guarda en la tabla `users` de Better Auth, en una columna propia que no se puede cambiar desde
// la web.
export class PostgresUserRoleRepository implements UserRoleRepository {
  constructor(private readonly db: Database) {}

  async getRole(userId: EntityId): Promise<UserRole> {
    const [row] = await this.db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    return row ? UserRoleSchema.parse(row.role) : "USER";
  }

  async setRole(userId: EntityId, role: UserRole): Promise<void> {
    await this.db.update(users).set({ role }).where(eq(users.id, userId));
  }

  // Solo para el script admin:grant / admin:revoke, que identifica la cuenta por su correo.
  async findUserIdByEmail(email: Email): Promise<EntityId | null> {
    const [row] = await this.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return row?.id ?? null;
  }
}
