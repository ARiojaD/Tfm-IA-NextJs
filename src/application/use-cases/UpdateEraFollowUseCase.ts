import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { failure, success, type Result } from "@/shared/Result";
import { UpdateEraFollowInputSchema } from "../dto/UpdateEraFollowInput";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { InvalidLibraryRequestError } from "../errors/InvalidLibraryRequestError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import type { AuthService } from "../ports/AuthService";
import type { LibraryRepository } from "../ports/LibraryRepository";
import type { RateLimiter } from "../ports/RateLimiter";

export interface UpdateEraFollowDependencies {
  library: LibraryRepository;
  auth: AuthService;
  rateLimiter: RateLimiter;
}

export type UpdateEraFollowError = AuthenticationRequiredError | RateLimitExceededError | InvalidLibraryRequestError;

// Follows or unfollows a civilization in the signed-in user's library.
export class UpdateEraFollowUseCase {
  constructor(private readonly dependencies: UpdateEraFollowDependencies) {}

  async execute(input: unknown): Promise<Result<{ era: HistoricalEra; following: boolean }, UpdateEraFollowError>> {
    // Whose library comes from the session, never from the input.
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("seguir una civilización"));
    }

    // Per user and checked before validating, so every attempt counts, valid or not.
    const decision = await this.dependencies.rateLimiter.consume(`user:${user.id}`);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    const parsedInput = UpdateEraFollowInputSchema.safeParse(input);
    if (!parsedInput.success) {
      return failure(new InvalidLibraryRequestError());
    }

    const { era, intent } = parsedInput.data;
    if (intent === "follow") {
      await this.dependencies.library.followEra(user.id, era);
    } else {
      await this.dependencies.library.unfollowEra(user.id, era);
    }

    return success({ era, following: intent === "follow" });
  }
}
