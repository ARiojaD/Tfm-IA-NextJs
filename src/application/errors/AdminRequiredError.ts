// El usuario con sesión no es administrador (OWASP A01: escalada de privilegios). Se comprueba en el
// servidor, en cada caso de uso de administración: ocultar el enlace al panel es solo una comodidad, nunca
// la protección.
export class AdminRequiredError extends Error {
  constructor() {
    super("Esta acción es solo para administradores");
    this.name = "AdminRequiredError";
  }
}
