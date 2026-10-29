// How BetterAuthService reads the visitor's request (cookies, user agent, IP) and writes the cookies
// Better Auth sets. In the app it is backed by Next.js (NextSessionCookies); in the integration tests,
// by an in-memory jar. This keeps the adapter independent of the framework, and testable.
export interface SessionCookies {
  // Headers of the current request, including its Cookie header.
  toHeaders(): Promise<Headers>;
  // Applies the Set-Cookie headers of a Better Auth response (only possible in Server Actions).
  apply(responseHeaders: Headers): Promise<void>;
}
