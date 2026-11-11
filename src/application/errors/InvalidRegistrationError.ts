import type { RegisterUserInput } from "../dto/RegisterUserInput";

// Fallo de validación de una cuenta nueva, con los mensajes listos para mostrarse junto a cada campo.
export class InvalidRegistrationError extends Error {
  constructor(
    readonly fieldErrors: Partial<Record<keyof RegisterUserInput, string[]>>,
    readonly formErrors: string[] = [],
  ) {
    super("Los datos del registro no son válidos");
    this.name = "InvalidRegistrationError";
  }
}
