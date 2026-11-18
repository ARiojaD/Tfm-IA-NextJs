import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, SECURITY_HEADERS } from "@/lib/securityHeaders";

// Cada directiva de la política como lista de valores, para comprobarlas una a una.
function directives(policy: string): Map<string, string[]> {
  return new Map(
    policy
      .split(";")
      .map((part) => part.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...values]) => [name, values]),
  );
}

describe("buildContentSecurityPolicy (OWASP A05, XSS)", () => {
  const production = directives(buildContentSecurityPolicy("abc123", { development: false }));

  it("solo deja ejecutar los scripts que llevan el nonce de esta petición", () => {
    expect(production.get("script-src")).toEqual(expect.arrayContaining(["'nonce-abc123'", "'strict-dynamic'"]));
    expect(production.get("script-src")).not.toContain("'unsafe-inline'");
    expect(production.get("script-src")).not.toContain("'unsafe-eval'");
  });

  it("nadie puede meter la web en un iframe (clickjacking)", () => {
    expect(production.get("frame-ancestors")).toEqual(["'none'"]);
  });

  it("todo lo demás, solo del propio dominio", () => {
    expect(production.get("default-src")).toEqual(["'self'"]);
    expect(production.get("object-src")).toEqual(["'none'"]);
    expect(production.get("base-uri")).toEqual(["'self'"]);
    expect(production.get("form-action")).toEqual(["'self'"]);
  });

  it("en desarrollo añade 'unsafe-eval', que React necesita para depurar; en producción nunca", () => {
    const development = directives(buildContentSecurityPolicy("abc123", { development: true }));

    expect(development.get("script-src")).toContain("'unsafe-eval'");
  });
});

describe("SECURITY_HEADERS", () => {
  const byName = new Map(SECURITY_HEADERS.map(({ key, value }) => [key.toLowerCase(), value]));

  it("el navegador no adivina el tipo de los archivos, ni envía la URL completa a otros sitios", () => {
    expect(byName.get("x-content-type-options")).toBe("nosniff");
    expect(byName.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
  });

  it("niega cámara, micrófono y ubicación, que la web no usa", () => {
    expect(byName.get("permissions-policy")).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });

  it("también prohíbe los iframes en los navegadores antiguos", () => {
    expect(byName.get("x-frame-options")).toBe("DENY");
  });
});
