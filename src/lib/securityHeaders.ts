// Las cabeceras de seguridad de todas las respuestas (OWASP A05). HSTS no está aquí: Vercel ya la envía.

// La política de seguridad de contenido de una petición. Los scripts solo se ejecutan si llevan el nonce de
// esa petición: Next se lo pone a los suyos y el layout al script del tema, y un script inyectado no lo
// tendría (XSS). 'strict-dynamic' deja que esos scripts carguen los demás trozos de la app.
// Los estilos sí admiten 'unsafe-inline': la web usa atributos style (la posición de cada etapa en la Línea
// de la Antigüedad), que un nonce no puede autorizar, e inyectar estilos es mucho menos grave que scripts.
// Las imágenes admiten data: por el grano de piedra del fondo, que es un SVG dentro del CSS.
export function buildContentSecurityPolicy(nonce: string, { development }: { development: boolean }): string {
  return [
    "default-src 'self'",
    // En desarrollo, React usa eval para reconstruir en el navegador las pilas de error del servidor.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// Las cabeceras fijas, iguales en todas las respuestas (next.config.ts).
export const SECURITY_HEADERS = [
  // El navegador no intenta adivinar el tipo de un archivo: un texto nunca se ejecuta como script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // A otros sitios solo les llega el dominio, nunca la ruta completa (que puede llevar ?q= con una pregunta).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Lo mismo que frame-ancestors 'none', para los navegadores que no entienden la CSP.
  { key: "X-Frame-Options", value: "DENY" },
];
