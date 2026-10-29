import { failure, success, type Result } from "@/shared/Result";
import { SignInInputSchema } from "../dto/SignInInput";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import type { AuthenticatedUser, AuthService } from "../ports/AuthService";
import type { RateLimiter } from "../ports/RateLimiter";

export interface SignInDependencies {
  auth: AuthService;
  rateLimiter: RateLimiter;
}

export type SignInError = RateLimitExceededError | InvalidCredentialsError;

// Signs a user in with email and password, protected against brute force with two limits:
// per visitor (one IP trying many passwords) and per account (many IPs trying one account).
export class SignInUseCase {
  constructor(private readonly dependencies: SignInDependencies) {}

  async execute(input: unknown, requesterId: string): Promise<Result<AuthenticatedUser, SignInError>> {
    const byVisitor = await this.dependencies.rateLimiter.consume(`visitor:${requesterId}`);
    if (!byVisitor.allowed) {
      return failure(new RateLimitExceededError(byVisitor.retryAfterSeconds));
    }

    const parsedInput = SignInInputSchema.safeParse(input);
    if (!parsedInput.success) {
      return failure(new InvalidCredentialsError());
    }

    const byAccount = await this.dependencies.rateLimiter.consume(`email:${parsedInput.data.email}`);
    if (!byAccount.allowed) {
      return failure(new RateLimitExceededError(byAccount.retryAfterSeconds));
    }

    const result = await this.dependencies.auth.signIn(parsedInput.data);
    if (!result.ok) {
      return failure(new InvalidCredentialsError());
    }
    return success(result.user);
  }
}
