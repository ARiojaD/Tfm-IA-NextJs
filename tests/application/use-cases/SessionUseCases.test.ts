import { describe, expect, it } from "vitest";
import { GetCurrentUserUseCase } from "@/application/use-cases/GetCurrentUserUseCase";
import { SignOutUseCase } from "@/application/use-cases/SignOutUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";

const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

describe("GetCurrentUserUseCase", () => {
  it("devuelve el usuario con la sesión iniciada", async () => {
    const auth = new InMemoryAuthService();
    const registered = await auth.register(livia);

    expect(await new GetCurrentUserUseCase({ auth, roles: new InMemoryUserRoleRepository() }).execute()).toEqual(
      registered.ok && { ...registered.user, isAdmin: false },
    );
  });

  it("devuelve null si nadie ha iniciado sesión", async () => {
    const useCase = new GetCurrentUserUseCase({ auth: new InMemoryAuthService(), roles: new InMemoryUserRoleRepository() });

    expect(await useCase.execute()).toBeNull();
  });
});

describe("SignOutUseCase", () => {
  it("cierra la sesión", async () => {
    const auth = new InMemoryAuthService();
    await auth.register(livia);

    await new SignOutUseCase({ auth }).execute();

    expect(await auth.getCurrentUser()).toBeNull();
  });

  it("no falla si no había sesión", async () => {
    await expect(new SignOutUseCase({ auth: new InMemoryAuthService() }).execute()).resolves.toBeUndefined();
  });
});
