// The action needs a signed-in user and there is none (OWASP A01: access control is enforced on the
// server, in the use case, never only by hiding a button in the interface).
export class AuthenticationRequiredError extends Error {
  constructor(action = "hacer esto") {
    super(`Inicia sesión para ${action}`);
    this.name = "AuthenticationRequiredError";
  }
}
