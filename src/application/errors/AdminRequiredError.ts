// The signed-in user is not an administrator (OWASP A01: privilege escalation). Checked on the server, in
// every admin use case: hiding the panel link is only a convenience, never the protection.
export class AdminRequiredError extends Error {
  constructor() {
    super("Esta acción es solo para administradores");
    this.name = "AdminRequiredError";
  }
}
