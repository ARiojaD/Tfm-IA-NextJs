import { z } from "zod";
import { failure, success, type Result } from "@/shared/Result";
import { RegisterUserInputSchema } from "../dto/RegisterUserInput";
import { InvalidRegistrationError } from "../errors/InvalidRegistrationError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import { RegistrationRejectedError } from "../errors/RegistrationRejectedError";
import type { AuthenticatedUser, AuthService } from "../ports/AuthService";
import type { BreachedPasswordChecker } from "../ports/BreachedPasswordChecker";
import type { RateLimiter } from "../ports/RateLimiter";

export interface RegisterUserDependencies {
  auth: AuthService;
  rateLimiter: RateLimiter;
  breachedPasswords: BreachedPasswordChecker;
}

const BREACHED_PASSWORD_MESSAGE = "Esta contraseña aparece en filtraciones de datos conocidas. Elige otra.";

export type RegisterUserError = RateLimitExceededError | InvalidRegistrationError | RegistrationRejectedError;

// Crea una cuenta e inicia la sesión del usuario nuevo.
export class RegisterUserUseCase {
  constructor(private readonly dependencies: RegisterUserDependencies) {}

  // La entrada viene de un formulario: es `unknown` hasta validarla. `requesterId` es la IP del visitante.
  async execute(input: unknown, requesterId: string): Promise<Result<AuthenticatedUser, RegisterUserError>> {
    // Antes de validar, para que también cuenten los intentos no válidos (nada de crear cuentas en masa con
    // un script).
    const decision = await this.dependencies.rateLimiter.consume(requesterId);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    const parsedInput = RegisterUserInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const { fieldErrors, formErrors } = z.flattenError(parsedInput.error);
      return failure(new InvalidRegistrationError(fieldErrors, formErrors));
    }

    if (await this.isBreached(parsedInput.data.password)) {
      return failure(new InvalidRegistrationError({ password: [BREACHED_PASSWORD_MESSAGE] }));
    }

    const registration = await this.dependencies.auth.register(parsedInput.data);
    if (!registration.ok) {
      return failure(new RegistrationRejectedError());
    }
    return success(registration.user);
  }

  // Si falla, deja pasar: si el servicio de filtraciones está caído, el registro sigue con las demás reglas
  // (longitud mínima, límite de peticiones). La caída de un servicio externo no puede impedir a todo el
  // mundo crear una cuenta.
  private async isBreached(password: string): Promise<boolean> {
    try {
      return await this.dependencies.breachedPasswords.isBreached(password);
    } catch {
      return false;
    }
  }
}
