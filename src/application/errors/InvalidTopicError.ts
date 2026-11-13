import type { z } from "zod";

// Cómo nombra cada lista del editor a sus filas en un mensaje de error.
const ROW_LABELS: Record<string, string> = {
  keyFacts: "Dato",
  events: "Evento",
  questions: "Pregunta",
  recommendations: "Recomendación",
  relatedTopicIds: "Tema",
  milestones: "Hito",
};

// Fallo de validación en el editor de temas. `fieldErrors` asigna a cada campo del formulario sus
// mensajes, listos para mostrarse junto al campo; `formErrors` guarda los que no son de ningún campo (por
// ejemplo, lo que falta para publicar).
export class InvalidTopicError extends Error {
  constructor(
    readonly fieldErrors: Record<string, string[]>,
    readonly formErrors: string[] = [],
  ) {
    super("Los datos del tema no son válidos");
    this.name = "InvalidTopicError";
  }

  // Desde los errores de Zod: el primer tramo de la ruta es el campo. Los errores dentro de una lista dicen
  // a qué fila pertenecen ("Evento 2: …"), porque una lista tiene una sola zona de mensajes para todas sus
  // filas. `prefix` coloca bajo su campo los errores de un esquema que valida solo la lista (por ejemplo,
  // los eventos).
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
