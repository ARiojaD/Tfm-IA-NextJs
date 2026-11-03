import type { z } from "zod";

// How each list of the editor names its rows in an error message.
const ROW_LABELS: Record<string, string> = {
  keyFacts: "Dato",
  events: "Evento",
  questions: "Pregunta",
  recommendations: "Recomendación",
  relatedTopicIds: "Tema",
};

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

  // From Zod issues: the first path segment is the field. Issues inside a list say which row they belong
  // to ("Evento 2: …"), since a list has one message area for all its rows. `prefix` puts the issues of
  // a schema that validates only the list (e.g. the events) under its field.
  static fromIssues(issues: z.core.$ZodIssue[], prefix: PropertyKey[] = []): InvalidTopicError {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of issues) {
      const [field, row] = [...prefix, ...issue.path];
      if (field === undefined) {
        formErrors.push(issue.message);
        continue;
      }
      const label = ROW_LABELS[String(field)] ?? "Elemento";
      const message = typeof row === "number" ? `${label} ${row + 1}: ${issue.message}` : issue.message;
      (fieldErrors[String(field)] ??= []).push(message);
    }
    return new InvalidTopicError(fieldErrors, formErrors);
  }
}
