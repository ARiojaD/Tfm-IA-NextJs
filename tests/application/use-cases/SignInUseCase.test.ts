import { beforeEach, describe, expect, it } from "vitest";
import { InvalidCredentialsError } from "@/application/errors/InvalidCredentialsError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { Clock } from "@/application/ports/Clock";
import { SignInUseCase } from "@/application/use-cases/SignInUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";

const fixedClock: Clock = { now: () => new Date("2026-10-29T12:00:00Z") };
const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };
const credentials = { email: livia.email, password: livia.password };
const VISITOR = "visitante-1";
const LIMIT = 3;

describe("SignInUseCase", () => {
  let auth: InMemoryAuthService;
  let useCase: SignInUseCase;

  beforeEach(async () => {
    auth = new InMemoryAuthService();
    await auth.register(livia);
    await auth.signOut();
    const rateLimiter = new InMemoryRateLimiter({ limit: LIMIT, windowMs: 60_000 }, fixedClock);
    useCase = new SignInUseCase({ auth, rateLimiter });
  });

  it("inicia sesión con el email y la contraseña correctos", async () => {
    const result = await useCase.execute(credentials, VISITOR);

    expect(result.success && result.data.name).toBe("Livia");
    expect(await auth.getCurrentUser()).toEqual(result.success && result.data);
  });

  it("acepta el email con mayúsculas o espacios (se normaliza)", async () => {
    const result = await useCase.execute({ ...credentials, email: "  Livia@Example.COM " }, VISITOR);

    expect(result.success).toBe(true);
  });

  it("una contraseña incorrecta da un error genérico", async () => {
    const result = await useCase.execute({ ...credentials, password: "no es la contraseña" }, VISITOR);

    expect(!result.success && result.error).toBeInstanceOf(InvalidCredentialsError);
    expect(!result.success && result.error.message).toBe("Email o contraseña incorrectos");
  });

  it("un email que no existe da exactamente el mismo error (no se puede saber qué emails tienen cuenta)", async () => {
    const wrongPassword = await useCase.execute({ ...credentials, password: "no es la contraseña" }, VISITOR);
    const unknownEmail = await useCase.execute({ ...credentials, email: "nadie@example.com" }, VISITOR);

    expect(!unknownEmail.success && unknownEmail.error).toEqual(!wrongPassword.success && wrongPassword.error);
  });

  it.each([
    ["campos vacíos", { email: "", password: "" }],
    ["un email mal formado", { email: "livia", password: livia.password }],
    ["una contraseña de más de 128 caracteres", { email: livia.email, password: "a".repeat(129) }],
    ["propiedades no permitidas", { ...credentials, rememberMe: true }],
    ["una entrada que no es un objeto", null],
  ])("con %s da el mismo error genérico, sin consultar las cuentas", async (_case, input) => {
    const result = await useCase.execute(input, VISITOR);

    expect(!result.success && result.error).toBeInstanceOf(InvalidCredentialsError);
    expect(await auth.getCurrentUser()).toBeNull();
  });

  describe("límite de frecuencia (OWASP API4: fuerza bruta)", () => {
    it("bloquea al visitante que supera el límite de intentos, aunque después acierte", async () => {
      for (let attempt = 0; attempt < LIMIT; attempt++) {
        await useCase.execute({ ...credentials, password: `intento fallido ${attempt}` }, VISITOR);
      }

      const result = await useCase.execute(credentials, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });

    it("bloquea también los intentos contra una misma cuenta desde visitantes distintos", async () => {
      for (let attempt = 0; attempt < LIMIT; attempt++) {
        await useCase.execute({ ...credentials, password: `intento fallido ${attempt}` }, `visitante-${attempt}`);
      }

      const result = await useCase.execute(credentials, "visitante-nuevo");

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });

    it("el límite por cuenta no afecta a otras cuentas", async () => {
      await auth.register({ name: "Marco", email: "marco@example.com", password: "el cruce del rubicon" });
      await auth.signOut();
      for (let attempt = 0; attempt < LIMIT; attempt++) {
        await useCase.execute({ ...credentials, password: `intento fallido ${attempt}` }, `visitante-${attempt}`);
      }

      const result = await useCase.execute(
        { email: "marco@example.com", password: "el cruce del rubicon" },
        "visitante-nuevo",
      );

      expect(result.success).toBe(true);
    });
  });
});
