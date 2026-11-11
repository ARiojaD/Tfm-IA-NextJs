import type { AddCommentInput } from "../dto/AddCommentInput";

// Fallo de validación de un comentario nuevo. `fieldErrors` asigna a cada campo del formulario sus
// mensajes, listos para mostrarse junto al campo; `formErrors` guarda los que no son de ningún campo.
export class InvalidCommentError extends Error {
  constructor(
    readonly fieldErrors: Partial<Record<keyof AddCommentInput, string[]>>,
    readonly formErrors: string[] = [],
  ) {
    super("Los datos del comentario no son válidos");
    this.name = "InvalidCommentError";
  }
}
