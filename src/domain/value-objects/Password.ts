import { z } from "zod";

// OWASP ASVS: al menos 12 caracteres y sin reglas de composición (una frase larga es mejor que "P4ss!"),
// con un máximo para que nadie obligue al servidor a calcular el hash de megas de texto. Nunca se recortan
// los espacios: forman parte de la contraseña.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PasswordSchema = z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);
