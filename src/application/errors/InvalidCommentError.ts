import type { AddCommentInput } from "../dto/AddCommentInput";

// Validation failure for a new comment. fieldErrors maps each form field to its messages,
// ready to be shown next to the input; formErrors holds the ones not tied to a field.
export class InvalidCommentError extends Error {
  constructor(
    readonly fieldErrors: Partial<Record<keyof AddCommentInput, string[]>>,
    readonly formErrors: string[] = [],
  ) {
    super("Los datos del comentario no son válidos");
    this.name = "InvalidCommentError";
  }
}
