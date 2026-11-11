// El único fallo de inicio de sesión que ve el usuario, pase lo que pase (correo desconocido, contraseña
// incorrecta o datos mal formados): mensajes distintos le dirían a un atacante qué correos tienen cuenta.
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Email o contraseña incorrectos");
    this.name = "InvalidCredentialsError";
  }
}
