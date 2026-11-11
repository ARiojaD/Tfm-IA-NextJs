import { z } from "zod";
import { DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_MIN_LENGTH, DisplayNameSchema } from "../value-objects/DisplayName";
import { EntityIdSchema } from "../value-objects/EntityId";

// El autor de un comentario es un nombre público: se aplican las mismas reglas.
export const COMMENT_AUTHOR_MIN_LENGTH = DISPLAY_NAME_MIN_LENGTH;
export const COMMENT_AUTHOR_MAX_LENGTH = DISPLAY_NAME_MAX_LENGTH;
export const COMMENT_MESSAGE_MAX_LENGTH = 500;

// Un comentario de la zona social de un tema. `userId` es la cuenta que lo escribió; solo falta en los
// comentarios del seed, escritos antes de que existieran las cuentas.
export const CommentSchema = z.strictObject({
  id: EntityIdSchema,
  topicId: EntityIdSchema,
  userId: EntityIdSchema.optional(),
  author: DisplayNameSchema,
  message: z.string().trim().min(1).max(COMMENT_MESSAGE_MAX_LENGTH),
  createdAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;
