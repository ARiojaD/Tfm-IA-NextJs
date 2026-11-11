import { z } from "zod";

// El nombre con el que un usuario aparece en público (por ejemplo, al firmar un comentario). Nunca su correo.
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;

export const DisplayNameSchema = z.string().trim().min(DISPLAY_NAME_MIN_LENGTH).max(DISPLAY_NAME_MAX_LENGTH);

export type DisplayName = z.infer<typeof DisplayNameSchema>;
