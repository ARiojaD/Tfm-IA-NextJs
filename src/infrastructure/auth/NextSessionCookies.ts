import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { cookies, headers } from "next/headers";
import type { SessionCookies } from "./SessionCookies";

// `SessionCookies` sobre la petición en curso de Next.js. Leer funciona en cualquier punto del servidor;
// escribir (`apply`), solo dentro de Server Actions y Route Handlers, que es donde se inicia y se cierra
// la sesión.
export class NextSessionCookies implements SessionCookies {
  async toHeaders(): Promise<Headers> {
    return new Headers(await headers());
  }

  async apply(responseHeaders: Headers): Promise<void> {
    const store = await cookies();
    for (const setCookie of responseHeaders.getSetCookie()) {
      for (const [name, attributes] of parseSetCookieHeader(setCookie)) {
        store.set(name, attributes.value, toCookieOptions(attributes));
      }
    }
  }
}
