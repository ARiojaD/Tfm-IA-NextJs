import { z } from "zod";
import { EmailSchema } from "@/domain/value-objects/Email";
import { PASSWORD_MAX_LENGTH } from "@/domain/value-objects/Password";

// What a visitor sends to sign in. No per-field messages on purpose: any problem ends in the same
// generic "Email o contraseña incorrectos". Only the maximum length is checked on the password (the
// minimum was enforced when the account was created), so huge inputs never reach the hashing.
export const SignInInputSchema = z.strictObject({
  email: EmailSchema,
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;
