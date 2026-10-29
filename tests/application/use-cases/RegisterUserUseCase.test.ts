import { beforeEach, describe, expect, it } from "vitest";
import { InvalidRegistrationError } from "@/application/errors/InvalidRegistrationError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { RegistrationRejectedError } from "@/application/errors/RegistrationRejectedError";
import type { Clock } from "@/application/ports/Clock";
import { RegisterUserUseCase } from "@/application/use-cases/RegisterUserUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";

const fixedClock: Clock = { now: () => new Date("2026-10-29T12:00:00Z") };
const validInput = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };
const VISITOR = "visitante-1";
const LIMIT = 3;

describe("RegisterUserUseCase", () => {
  let auth: InMemoryAuthService;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    auth = new InMemoryAuthService();
    const rateLimiter = new InMemoryRateLimiter({ limit: LIMIT, windowMs: 600_000 }, fixedClock);
    useCase = new RegisterUserUseCase({ auth, rateLimiter });
  });

  it("crea la cuenta, inicia la sesión y devuelve el usuario", async () => {
    const result = await useCase.execute(validInput, VISITOR);

    expect(result.success && result.data.name).toBe("Livia");
    expect(await auth.getCurrentUser()).toEqual(result.success && result.data);
  });

  it("normaliza el nombre y el email antes de registrar", async () => {
    await useCase.execute({ ...validInput, name: "  Livia  ", email: "  Livia@Example.COM " }, VISITOR);
    await auth.signOut();

    const signIn = await auth.signIn({ email: "livia@example.com", password: validInput.password });

    expect(signIn.ok && signIn.user.name).toBe("Livia");
  });

  it("si el email ya tiene cuenta, devuelve un error genérico que no confirma que exista", async () => {
    await useCase.execute(validInput, VISITOR);

    const result = await useCase.execute({ ...validInput, name: "Otra" }, "visitante-2");

    expect(!result.success && result.error).toBeInstanceOf(RegistrationRejectedError);
    expect(!result.success && result.error.message).not.toMatch(/existe|registrad/i);
  });

  describe("entrada inválida", () => {
    it.each([
      ["un nombre de menos de 2 caracteres", { name: "L" }, "name"],
      ["un nombre de más de 40 caracteres", { name: "a".repeat(41) }, "name"],
      ["un email mal formado", { email: "livia" }, "email"],
      ["una contraseña de menos de 12 caracteres", { password: "corta" }, "password"],
      ["una contraseña de más de 128 caracteres", { password: "a".repeat(129) }, "password"],
    ])("rechaza %s indicando el campo, sin crear la cuenta", async (_case, overrides, field) => {
      const result = await useCase.execute({ ...validInput, ...overrides }, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(InvalidRegistrationError);
      expect(!result.success && result.error instanceof InvalidRegistrationError && result.error.fieldErrors).toHaveProperty(
        field,
      );
      expect(await auth.getCurrentUser()).toBeNull();
    });

    it("los mensajes están en español y explican la regla", async () => {
      const result = await useCase.execute({ ...validInput, password: "corta" }, VISITOR);

      expect(!result.success && result.error instanceof InvalidRegistrationError && result.error.fieldErrors.password).toEqual([
        "La contraseña debe tener al menos 12 caracteres",
      ]);
    });

    it("rechaza propiedades no permitidas (prevención de Mass Assignment, p. ej. emailVerified)", async () => {
      const result = await useCase.execute({ ...validInput, emailVerified: true }, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(InvalidRegistrationError);
    });

    it.each([null, "texto", 42, undefined])("rechaza una entrada que no es un objeto: %j", async (input) => {
      const result = await useCase.execute(input, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(InvalidRegistrationError);
    });
  });

  describe("límite de frecuencia (OWASP API4)", () => {
    it("rechaza los registros que superan el límite del visitante", async () => {
      for (let attempt = 0; attempt < LIMIT; attempt++) {
        await useCase.execute({ ...validInput, email: `livia${attempt}@example.com` }, VISITOR);
      }

      const result = await useCase.execute({ ...validInput, email: "otra@example.com" }, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });

    it("cuenta también los intentos inválidos", async () => {
      for (let attempt = 0; attempt < LIMIT; attempt++) await useCase.execute({}, VISITOR);

      const result = await useCase.execute(validInput, VISITOR);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });
  });
});
