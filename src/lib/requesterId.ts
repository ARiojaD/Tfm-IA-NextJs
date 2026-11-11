// Identifica quién llama a una Server Action anónima, para los límites de peticiones. Las acciones con
// sesión limitan por usuario (`user:<id>`), no por IP.
//
// SEGURIDAD: x-forwarded-for y x-real-ip los puede falsear el cliente salvo que un proxy de confianza
// (Vercel, Nginx…) los sobrescriba. Hay que desplegar detrás de uno; si no, un atacante puede ir cambiando
// de IP falsa para esquivar el límite.

export const ANONYMOUS_REQUESTER = "anonymous";

// Solo caracteres de IPv4 / IPv6 y como mucho 45 (la IPv6 más larga en texto): rechaza la basura e impide
// que un cliente llene el limitador con claves enormes o infinitas.
const IP_PATTERN = /^[0-9a-fA-F.:]{3,45}$/;

export function requesterIdFromHeaders(headers: Headers): string {
  const candidate = headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip") ?? "";
  const ip = candidate.trim();

  return IP_PATTERN.test(ip) ? `ip:${ip}` : ANONYMOUS_REQUESTER;
}
