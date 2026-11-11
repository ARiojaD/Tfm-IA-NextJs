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

// Publica el comentario del usuario con sesión en la zona social de un tema.
export class AddCommentUseCase {
  constructor(private readonly dependencies: AddCommentDependencies) {}

  // La entrada es `unknown` a propósito: viene de un formulario, así que no se confía en nada de ella
  // hasta validarla.
  async execute(input: unknown): Promise<Result<Comment, AddCommentError>> {
    // Quién comenta sale de la sesión, nunca de la entrada.
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("comentar"));
    }

    // Por usuario y antes de validar, para que cuenten todos los intentos, válidos o no.
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

    // El servidor decide el id, el tema, el autor y la fecha; el esquema del dominio es la última
    // comprobación antes de guardar.
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
