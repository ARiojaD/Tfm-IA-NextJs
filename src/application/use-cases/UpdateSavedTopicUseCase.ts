import type { EntityId } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { UpdateSavedTopicInputSchema } from "../dto/UpdateSavedTopicInput";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { InvalidLibraryRequestError } from "../errors/InvalidLibraryRequestError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { AuthService } from "../ports/AuthService";
import type { Clock } from "../ports/Clock";
import type { LibraryRepository } from "../ports/LibraryRepository";
import type { RateLimiter } from "../ports/RateLimiter";
import type { TopicRepository } from "../ports/TopicRepository";

export interface UpdateSavedTopicDependencies {
  topics: TopicRepository;
  library: LibraryRepository;
  auth: AuthService;
  clock: Clock;
  rateLimiter: RateLimiter;
}

export type UpdateSavedTopicError =
  | AuthenticationRequiredError
  | RateLimitExceededError
  | InvalidLibraryRequestError
  | TopicNotFoundError;

// Guarda un tema en la biblioteca del usuario con sesión (o lo quita).
export class UpdateSavedTopicUseCase {
  constructor(private readonly dependencies: UpdateSavedTopicDependencies) {}

  async execute(input: unknown): Promise<Result<{ topicId: EntityId; saved: boolean }, UpdateSavedTopicError>> {
    // De quién es la biblioteca sale de la sesión, nunca de la entrada.
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("guardar temas"));
    }

    // Por usuario y antes de validar, para que cuenten todos los intentos, válidos o no.
    const decision = await this.dependencies.rateLimiter.consume(`user:${user.id}`);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    const parsedInput = UpdateSavedTopicInputSchema.safeParse(input);
    if (!parsedInput.success) {
      return failure(new InvalidLibraryRequestError());
    }

    const { topicSlug, intent } = parsedInput.data;
    const topic = await this.dependencies.topics.findBySlug(topicSlug);
    if (!topic) {
      return failure(new TopicNotFoundError(topicSlug));
    }

    if (intent === "save") {
      await this.dependencies.library.saveTopic(user.id, topic.id, this.dependencies.clock.now());
    } else {
      await this.dependencies.library.removeSavedTopic(user.id, topic.id);
    }

    return success({ topicId: topic.id, saved: intent === "save" });
  }
}
