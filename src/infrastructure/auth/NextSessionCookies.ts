import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { cookies, headers } from "next/headers";
import type { SessionCookies } from "./SessionCookies";

// SessionCookies backed by the current Next.js request. Reading works anywhere on the server; writing
// (apply) only inside Server Actions and Route Handlers, which is where sign-in and sign-out happen.
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
