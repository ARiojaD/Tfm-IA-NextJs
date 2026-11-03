import { describe, expect, it } from "vitest";
import { UserRoleSchema } from "@/domain/value-objects/UserRole";

describe("UserRoleSchema", () => {
  it.each(["USER", "ADMIN"])("acepta el rol %s", (role) => {
    expect(UserRoleSchema.safeParse(role).success).toBe(true);
  });

  it.each(["admin", "SUPERADMIN", "", null])("rechaza un rol desconocido: %j", (role) => {
    expect(UserRoleSchema.safeParse(role).success).toBe(false);
  });
});
