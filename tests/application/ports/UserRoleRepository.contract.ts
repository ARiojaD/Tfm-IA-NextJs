import { describe, expect, it } from "vitest";
import type { UserRoleRepository } from "@/application/ports/UserRoleRepository";

// Users the contract works with. In PostgreSQL they must exist: the integration test creates them.
export const ROLE_CONTRACT_USERS = ["user-1", "user-2"] as const;

const [livia, marco] = ROLE_CONTRACT_USERS;

export function describeUserRoleRepositoryContract(
  name: string,
  createRepository: () => UserRoleRepository | Promise<UserRoleRepository>,
) {
  describe(`${name} cumple el contrato de UserRoleRepository`, () => {
    it("una cuenta nueva es un usuario normal", async () => {
      const repository = await createRepository();

      expect(await repository.getRole(livia)).toBe("USER");
    });

    it("una cuenta desconocida es un usuario normal, nunca admin", async () => {
      const repository = await createRepository();

      expect(await repository.getRole("cuenta-que-no-existe")).toBe("USER");
    });

    it("nombra administradora a una cuenta", async () => {
      const repository = await createRepository();

      await repository.setRole(livia, "ADMIN");

      expect(await repository.getRole(livia)).toBe("ADMIN");
    });

    it("quita el rol de administradora", async () => {
      const repository = await createRepository();
      await repository.setRole(livia, "ADMIN");

      await repository.setRole(livia, "USER");

      expect(await repository.getRole(livia)).toBe("USER");
    });

    it("el rol es de cada cuenta: nombrar a una no cambia a las demás", async () => {
      const repository = await createRepository();

      await repository.setRole(livia, "ADMIN");

      expect(await repository.getRole(marco)).toBe("USER");
    });
  });
}
