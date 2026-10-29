import { describe, expect, it } from "vitest";
import { GetCurrentUserUseCase } from "@/application/use-cases/GetCurrentUserUseCase";
import { SignOutUseCase } from "@/application/use-cases/SignOutUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";

const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

describe("GetCurrentUserUseCase", () => {
  it("devuelve el usuario con la sesión iniciada", async () => {
    const auth = new InMemoryAuthService();
    const registered = await auth.register(livia);

    expect(await new GetCurrentUserUseCase({ auth }).execute()).toEqual(registered.ok && registered.user);
  });

  it("devuelve null si nadie ha iniciado sesión", async () => {
    expect(await new GetCurrentUserUseCase({ auth: new InMemoryAuthService() }).execute()).toBeNull();
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
