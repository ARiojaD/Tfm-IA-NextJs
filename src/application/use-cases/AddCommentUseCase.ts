import { z } from "zod";
import { CommentSchema, type Comment } from "@/domain/entities/Comment";
import { failure, success, type Result } from "@/shared/Result";
import { AddCommentInputSchema } from "../dto/AddCommentInput";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { InvalidCommentError } from "../errors/InvalidCommentError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { AuthService } from "../ports/AuthService";
import type { Clock } from "../ports/Clock";
import type { CommentRepository } from "../ports/CommentRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import type { RateLimiter } from "../ports/RateLimiter";
import type { TopicRepository } from "../ports/TopicRepository";

export interface AddCommentDependencies {
  topics: TopicRepository;
  comments: CommentRepository;
  auth: AuthService;
  clock: Clock;
  ids: IdGenerator;
  rateLimiter: RateLimiter;
}

export type AddCommentError =
  | AuthenticationRequiredError
  | RateLimitExceededError
  | InvalidCommentError
  | TopicNotFoundError;

// Posts the signed-in user's comment to a topic's social zone.
export class AddCommentUseCase {
  constructor(private readonly dependencies: AddCommentDependencies) {}

  // The input is `unknown` on purpose: it comes from a form, so nothing about it is trusted until validated.
  async execute(input: unknown): Promise<Result<Comment, AddCommentError>> {
    // Who comments comes from the session, never from the input.
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("comentar"));
    }

    // Per user and checked before validating, so every attempt counts, valid or not.
    const decision = await this.dependencies.rateLimiter.consume(`user:${user.id}`);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    const parsedInput = AddCommentInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const { fieldErrors, formErrors } = z.flattenError(parsedInput.error);
      return failure(new InvalidCommentError(fieldErrors, formErrors));
    }

    const { topicSlug, message } = parsedInput.data;
    const topic = await this.dependencies.topics.findBySlug(topicSlug);
    if (!topic) {
      return failure(new TopicNotFoundError(topicSlug));
    }

    // The server decides id, topic, author and date; the domain schema is the last check before saving.
    const comment = CommentSchema.parse({
      id: this.dependencies.ids.generate(),
      topicId: topic.id,
      userId: user.id,
      author: user.name,
      message,
      createdAt: this.dependencies.clock.now(),
    });
    await this.dependencies.comments.add(comment);

    return success(comment);
  }
}
