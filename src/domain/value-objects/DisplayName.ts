import { z } from "zod";

// The name a user is shown with publicly (e.g. signing a comment). Never the email.
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;

export const DisplayNameSchema = z.string().trim().min(DISPLAY_NAME_MIN_LENGTH).max(DISPLAY_NAME_MAX_LENGTH);

export type DisplayName = z.infer<typeof DisplayNameSchema>;
