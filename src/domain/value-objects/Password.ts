import { z } from "zod";

// OWASP ASVS: at least 12 characters, no composition rules (a long passphrase beats "P4ss!"), and a
// maximum so nobody can make the server hash megabytes of text. Never trimmed: spaces are part of it.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const PasswordSchema = z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);
