import { z } from "zod";

// Se normaliza (sin espacios y en minúsculas) para que "Livia@Example.com" y "livia@example.com" sean la
// misma cuenta. 254 caracteres es la longitud máxima de una dirección de correo.
export const EmailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export type Email = z.infer<typeof EmailSchema>;
