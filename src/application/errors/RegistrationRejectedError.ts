// The account could not be created with valid data (today, only because the email already has one).
// Deliberately vague: confirming that an email is registered would let anyone list our users.
export class RegistrationRejectedError extends Error {
  constructor() {
    super("No se ha podido crear la cuenta. Revisa los datos o, si ya tienes cuenta, inicia sesión.");
    this.name = "RegistrationRejectedError";
  }
}
