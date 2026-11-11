// Cómo lee `BetterAuthService` la petición del visitante (cookies, user agent, IP) y cómo escribe las
// cookies que pone Better Auth. En la aplicación se apoya en Next.js (`NextSessionCookies`); en los tests
// de integración, en un tarro de cookies en memoria. Así el adaptador no depende del framework y se puede
// probar.
export interface SessionCookies {
  // Las cabeceras de la petición en curso, incluida su cabecera Cookie.
  toHeaders(): Promise<Headers>;
  // Aplica las cabeceras Set-Cookie de una respuesta de Better Auth (solo es posible en Server Actions).
  apply(responseHeaders: Headers): Promise<void>;
}
