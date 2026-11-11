import { z } from "zod";
import { COMMENT_MESSAGE_MAX_LENGTH } from "@/domain/entities/Comment";
import { SlugSchema } from "@/domain/value-objects/Slug";

// Lo que envía un usuario con sesión para publicar un comentario: solo el tema y el texto. El autor, el
// usuario, el id y la fecha los decide el servidor (con la sesión, `IdGenerator` y `Clock`). Es estricto,
// así que un formulario que intente enviar `author` o `userId` se rechaza: nadie puede comentar en nombre
// de otro.
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
