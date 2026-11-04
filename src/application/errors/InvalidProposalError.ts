import type { z } from "zod";

// Validation failure of a proposal (or of its review). fieldErrors maps each form field to its messages;
// formErrors holds the ones not tied to a field (e.g. an unexpected field in a tampered request).
export class InvalidProposalError extends Error {
  constructor(
    readonly fieldErrors: Record<string, string[]>,
    readonly formErrors: string[] = [],
  ) {
    super("La propuesta no es válida");
    this.name = "InvalidProposalError";
  }

  static fromIssues(issues: z.core.$ZodIssue[]): InvalidProposalError {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];
    for (const issue of issues) {
      const [field] = issue.path;
      if (field === undefined) formErrors.push(issue.message);
      else (fieldErrors[String(field)] ??= []).push(issue.message);
    }
    return new InvalidProposalError(fieldErrors, formErrors);
  }
}
