import type { z } from "zod";

// Fallo de validación de una propuesta (o de su revisión). `fieldErrors` asigna a cada campo del
// formulario sus mensajes; `formErrors` guarda los que no son de ningún campo (por ejemplo, un campo
// inesperado en una petición manipulada).
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
