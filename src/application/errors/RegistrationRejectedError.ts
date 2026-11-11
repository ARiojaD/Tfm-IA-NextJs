// La cuenta no se pudo crear con datos válidos (hoy, solo porque el correo ya tiene una). Es vago a
// propósito: confirmar que un correo está registrado permitiría a cualquiera sacar la lista de usuarios.
export class RegistrationRejectedError extends Error {
  constructor() {
    super("No se ha podido crear la cuenta. Revisa los datos o, si ya tienes cuenta, inicia sesión.");
    this.name = "RegistrationRejectedError";
  }
}
