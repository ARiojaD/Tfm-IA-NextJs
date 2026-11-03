import type { z } from "zod";

// Validation failure in the topic editor. fieldErrors maps each form field to its messages, ready to show
// next to the input; formErrors holds the ones not tied to a field (e.g. what is missing to publish).
export class InvalidTopicError extends Error {
  constructor(
    readonly fieldErrors: Record<string, string[]>,
    readonly formErrors: string[] = [],
  ) {
    super("Los datos del tema no son válidos");
    this.name = "InvalidTopicError";
  }

  // From Zod issues: the first path segment is the field. Issues inside a list (the key facts) say which
  // row they belong to ("Dato 2: …"), since a list has one message area for all its rows.
  static fromIssues(issues: z.core.$ZodIssue[]): InvalidTopicError {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of issues) {
      const [field, row] = issue.path;
      if (field === undefined) {
        formErrors.push(issue.message);
        continue;
      }
      const message = typeof row === "number" ? `Dato ${row + 1}: ${issue.message}` : issue.message;
      (fieldErrors[String(field)] ??= []).push(message);
    }
    return new InvalidTopicError(fieldErrors, formErrors);
  }
}
