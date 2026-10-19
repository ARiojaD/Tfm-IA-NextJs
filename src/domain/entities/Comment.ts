import { z } from "zod";
import { EntityIdSchema } from "../value-objects/EntityId";

export const COMMENT_AUTHOR_MIN_LENGTH = 2;
export const COMMENT_AUTHOR_MAX_LENGTH = 40;
export const COMMENT_MESSAGE_MAX_LENGTH = 500;

export const CommentSchema = z.strictObject({
  id: EntityIdSchema,
  topicId: EntityIdSchema,
  author: z.string().trim().min(COMMENT_AUTHOR_MIN_LENGTH).max(COMMENT_AUTHOR_MAX_LENGTH),
  message: z.string().trim().min(1).max(COMMENT_MESSAGE_MAX_LENGTH),
  createdAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;
