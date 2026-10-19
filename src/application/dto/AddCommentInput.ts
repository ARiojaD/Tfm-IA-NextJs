import { z } from "zod";
import {
  COMMENT_AUTHOR_MAX_LENGTH,
  COMMENT_AUTHOR_MIN_LENGTH,
  COMMENT_MESSAGE_MAX_LENGTH,
} from "@/domain/entities/Comment";
import { SlugSchema } from "@/domain/value-objects/Slug";

// What a visitor sends to post a comment. Unlike the Comment entity, it carries user-facing
// Spanish messages for the form, and never id, topicId or createdAt: those are set by the use case.
export const AddCommentInputSchema = z.strictObject(
  {
    topicSlug: SlugSchema,
    author: z
      .string({ error: "Indica tu nombre" })
      .trim()
      .min(COMMENT_AUTHOR_MIN_LENGTH, { error: `El nombre debe tener al menos ${COMMENT_AUTHOR_MIN_LENGTH} caracteres` })
      .max(COMMENT_AUTHOR_MAX_LENGTH, {
        error: `El nombre no puede superar los ${COMMENT_AUTHOR_MAX_LENGTH} caracteres`,
      }),
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
