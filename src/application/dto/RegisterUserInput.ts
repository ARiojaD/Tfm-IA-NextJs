import { z } from "zod";
import { DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_MIN_LENGTH } from "@/domain/value-objects/DisplayName";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/domain/value-objects/Password";

// Lo que envía un visitante para crear una cuenta: las reglas del dominio (`DisplayName`, `Email`,
// `Password`) con mensajes en castellano para el formulario. Es estricto: cualquier otro campo
// (`emailVerified`, `role`…) se rechaza.
export const RegisterUserInputSchema = z.strictObject(
  {
    name: z
      .string({ error: "Indica tu nombre" })
      .trim()
      .min(DISPLAY_NAME_MIN_LENGTH, { error: `El nombre debe tener al menos ${DISPLAY_NAME_MIN_LENGTH} caracteres` })
      .max(DISPLAY_NAME_MAX_LENGTH, { error: `El nombre no puede superar los ${DISPLAY_NAME_MAX_LENGTH} caracteres` }),
    email: z
      .string({ error: "Indica tu email" })
      .trim()
      .toLowerCase()
      .max(254, { error: "El email es demasiado largo" })
      .pipe(z.email({ error: "El email no es válido" })),
    password: z
      .string({ error: "Indica una contraseña" })
      .min(PASSWORD_MIN_LENGTH, { error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` })
      .max(PASSWORD_MAX_LENGTH, { error: `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres` }),
  },
  { error: "Los datos del registro no son válidos" },
);

export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;
