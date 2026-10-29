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

// Creates an account and signs the new user in.
export class RegisterUserUseCase {
  constructor(private readonly dependencies: RegisterUserDependencies) {}

  // The input comes from a form: `unknown` until validated. requesterId is the visitor's IP.
  async execute(input: unknown, requesterId: string): Promise<Result<AuthenticatedUser, RegisterUserError>> {
    // Before validating, so invalid attempts count too (no mass account creation by script).
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

  // Fails open: if the breach service is down, the sign-up goes on with the other rules (minimum length,
  // rate limit). An outage of an external service must not lock everyone out of creating an account.
  private async isBreached(password: string): Promise<boolean> {
    try {
      return await this.dependencies.breachedPasswords.isBreached(password);
    } catch {
      return false;
    }
  }
}
