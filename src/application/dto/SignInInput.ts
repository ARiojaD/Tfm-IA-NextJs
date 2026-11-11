import { z } from "zod";
import { EmailSchema } from "@/domain/value-objects/Email";
import { PASSWORD_MAX_LENGTH } from "@/domain/value-objects/Password";

// Lo que envía un visitante para iniciar sesión. Sin mensajes por campo a propósito: cualquier problema
// acaba en el mismo "Email o contraseña incorrectos". De la contraseña solo se comprueba el máximo (el
// mínimo se exigió al crear la cuenta), para que un texto enorme nunca llegue al cálculo del hash.
export const SignInInputSchema = z.strictObject({
  email: EmailSchema,
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;
