// Adónde se envía al usuario después de iniciar sesión (?volver=/roma/...). Solo se aceptan rutas de este
// sitio: una URL absoluta, una relativa al protocolo (//host) o el truco de la barra invertida (/\host, que
// los navegadores tratan como //host) convertirían la página de inicio de sesión en una redirección
// abierta para enlaces de phishing.
const INTERNAL_PATH = /^\/(?![/\\])[^\s\\]*$/;
const MAX_LENGTH = 512;

export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length > MAX_LENGTH || !INTERNAL_PATH.test(value)) {
    return fallback;
  }
  return value;
}
