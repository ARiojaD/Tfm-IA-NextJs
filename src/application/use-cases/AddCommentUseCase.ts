import { z } from "zod";
import { CommentSchema, type Comment } from "@/domain/entities/Comment";
import { failure, success, type Result } from "@/shared/Result";
import { AddCommentInputSchema } from "../dto/AddCommentInput";
import { InvalidCommentError } from "../errors/InvalidCommentError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { Clock } from "../ports/Clock";
import type { CommentRepository } from "../ports/CommentRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import type { TopicRepository } from "../ports/TopicRepository";

export interface AddCommentDependencies {
  topics: TopicRepository;
  comments: CommentRepository;
  clock: Clock;
  ids: IdGenerator;
}

// Posts a visitor's comment to a topic's social zone.
export class AddCommentUseCase {
  constructor(private readonly dependencies: AddCommentDependencies) {}

  // The input is `unknown` on purpose: it comes from a form, so nothing about it is trusted until validated.
  async execute(input: unknown): Promise<Result<Comment, InvalidCommentError | TopicNotFoundError>> {
    const parsedInput = AddCommentInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const { fieldErrors, formErrors } = z.flattenError(parsedInput.error);
      return failure(new InvalidCommentError(fieldErrors, formErrors));
    }

    const { topicSlug, author, message } = parsedInput.data;
    const topic = await this.dependencies.topics.findBySlug(topicSlug);
    if (!topic) {
      return failure(new TopicNotFoundError(topicSlug));
    }

    // The server decides id, topic and date; the domain schema is the last check before saving.
    const comment = CommentSchema.parse({
      id: this.dependencies.ids.generate(),
      topicId: topic.id,
      author,
      message,
      createdAt: this.dependencies.clock.now(),
    });
    await this.dependencies.comments.add(comment);

    return success(comment);
  }
}
