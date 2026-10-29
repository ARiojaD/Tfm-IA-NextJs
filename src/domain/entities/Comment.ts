import { z } from "zod";
import { DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_MIN_LENGTH, DisplayNameSchema } from "../value-objects/DisplayName";
import { EntityIdSchema } from "../value-objects/EntityId";

// The author of a comment is a display name: the same rules apply.
export const COMMENT_AUTHOR_MIN_LENGTH = DISPLAY_NAME_MIN_LENGTH;
export const COMMENT_AUTHOR_MAX_LENGTH = DISPLAY_NAME_MAX_LENGTH;
export const COMMENT_MESSAGE_MAX_LENGTH = 500;

// userId is the account that wrote it. Missing only in the seed comments, written before accounts existed.
export const CommentSchema = z.strictObject({
  id: EntityIdSchema,
  topicId: EntityIdSchema,
  userId: EntityIdSchema.optional(),
  author: DisplayNameSchema,
  message: z.string().trim().min(1).max(COMMENT_MESSAGE_MAX_LENGTH),
  createdAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;
