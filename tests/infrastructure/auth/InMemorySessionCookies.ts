import { parseSetCookieHeader } from "better-auth/cookies";
import type { SessionCookies } from "@/infrastructure/auth/SessionCookies";

// El tarro de cookies de un navegador, para los tests de integración: guarda lo que pone el servidor y lo devuelve.
export class InMemorySessionCookies implements SessionCookies {
  private readonly jar = new Map<string, { value: string; httpOnly: boolean; sameSite: string | undefined }>();

  toHeaders(): Promise<Headers> {
    const cookieHeader = [...this.jar].map(([name, cookie]) => `${name}=${cookie.value}`).join("; ");
    return Promise.resolve(new Headers(cookieHeader ? { cookie: cookieHeader } : {}));
  }

  apply(responseHeaders: Headers): Promise<void> {
    for (const setCookie of responseHeaders.getSetCookie()) {
      for (const [name, attributes] of parseSetCookieHeader(setCookie)) {
        const expired = attributes["max-age"] !== undefined && attributes["max-age"] <= 0;
        if (expired || attributes.value === "") {
          this.jar.delete(name);
        } else {
          this.jar.set(name, {
            value: attributes.value,
            httpOnly: attributes.httponly === true,
            sameSite: attributes.samesite,
          });
        }
      }
    }
    return Promise.resolve();
  }

  get(name: string) {
    return this.jar.get(name);
  }

  names(): string[] {
    return [...this.jar.keys()];
  }
}
