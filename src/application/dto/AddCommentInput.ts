import { z } from "zod";
import { COMMENT_MESSAGE_MAX_LENGTH } from "@/domain/entities/Comment";
import { SlugSchema } from "@/domain/value-objects/Slug";

// What a signed-in user sends to post a comment: only the topic and the text. The author, the user, the
// id and the date are decided by the server (from the session, IdGenerator and Clock). Strict, so a form
// that tries to send author or userId is rejected: nobody can comment in someone else's name.
export const AddCommentInputSchema = z.strictObject(
  {
    topicSlug: SlugSchema,
    message: z
      .string({ error: "Escribe un comentario" })
      .trim()
      .min(1, { error: "El comentario no puede estar vacío" })
      .max(COMMENT_MESSAGE_MAX_LENGTH, {
        error: `El comentario no puede superar los ${COMMENT_MESSAGE_MAX_LENGTH} caracteres`,
      }),
  },
  { error: "Los datos del comentario no son válidos" },
);

export type AddCommentInput = z.infer<typeof AddCommentInputSchema>;
