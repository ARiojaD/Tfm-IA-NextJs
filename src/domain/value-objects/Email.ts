import { z } from "zod";

// Normalised (trimmed, lower case) so "Livia@Example.com" and "livia@example.com" are the same account.
// 254 characters is the maximum length of an email address.
export const EmailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export type Email = z.infer<typeof EmailSchema>;
