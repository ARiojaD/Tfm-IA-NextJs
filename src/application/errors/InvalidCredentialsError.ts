// The only sign-in failure the user ever sees, whatever happened (unknown email, wrong password or
// malformed input): different messages would tell an attacker which emails have an account.
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Email o contraseña incorrectos");
    this.name = "InvalidCredentialsError";
  }
}
