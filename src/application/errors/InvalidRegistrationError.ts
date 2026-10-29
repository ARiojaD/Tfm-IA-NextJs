import type { RegisterUserInput } from "../dto/RegisterUserInput";

// Validation failure for a new account, with the messages ready to show next to each field.
export class InvalidRegistrationError extends Error {
  constructor(
    readonly fieldErrors: Partial<Record<keyof RegisterUserInput, string[]>>,
    readonly formErrors: string[] = [],
  ) {
    super("Los datos del registro no son válidos");
    this.name = "InvalidRegistrationError";
  }
}
