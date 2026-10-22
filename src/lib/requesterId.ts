// Identifies who is calling a Server Action, for rate limiting.
//
// SECURITY: x-forwarded-for / x-real-ip can be forged by the client unless a trusted proxy
// (Vercel, Nginx…) overwrites them. Deploy behind one; otherwise an attacker can rotate fake IPs
// to dodge the limit. Once authentication exists, prefer the user id over the IP.

export const ANONYMOUS_REQUESTER = "anonymous";

// IPv4 / IPv6 characters only, at most 45 chars (longest textual IPv6): rejects junk and stops a
// client from flooding the rate limiter with huge or endless distinct keys.
const IP_PATTERN = /^[0-9a-fA-F.:]{3,45}$/;

export function requesterIdFromHeaders(headers: Headers): string {
  const candidate = headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip") ?? "";
  const ip = candidate.trim();

  return IP_PATTERN.test(ip) ? `ip:${ip}` : ANONYMOUS_REQUESTER;
}
