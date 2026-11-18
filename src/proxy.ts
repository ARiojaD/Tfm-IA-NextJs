import { type NextRequest, NextResponse } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/securityHeaders";

// Se ejecuta antes de cada página: genera un nonce nuevo y la política de seguridad de contenido que lo
// usa. Next lee la política de la petición y pone el nonce en sus propios scripts; el layout lo lee de
// x-nonce para el script del tema. Todas las páginas se renderizan en cada petición, así que cada una
// recibe su nonce.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = buildContentSecurityPolicy(nonce, { development: process.env.NODE_ENV === "development" });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

// Fuera quedan los archivos estáticos y las imágenes optimizadas, que no ejecutan nada, y las precargas
// de next/link, que no son la página que se muestra.
export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|images/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
