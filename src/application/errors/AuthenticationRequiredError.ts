// La acción necesita un usuario con sesión y no lo hay (OWASP A01: el control de acceso se hace en el
// servidor, en el caso de uso, nunca solo ocultando un botón en la interfaz).
export class AuthenticationRequiredError extends Error {
  constructor(action = "hacer esto") {
    super(`Inicia sesión para ${action}`);
    this.name = "AuthenticationRequiredError";
  }
}
