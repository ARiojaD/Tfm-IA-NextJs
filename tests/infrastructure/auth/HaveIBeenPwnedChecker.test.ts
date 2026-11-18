import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { HaveIBeenPwnedChecker } from "@/infrastructure/auth/HaveIBeenPwnedChecker";

// SHA-1("password") = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8 → prefijo 5BAA6; el resto es el sufijo.
const PASSWORD = "password";
const PREFIX = "5BAA6";
const SUFFIX = "1E4C9B93F3F0682250B6CF8331B7EE68FD8";

function fakeFetch(body: string, status = 200) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const fetchFn = (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return Promise.resolve(new Response(body, { status }));
  };
  return { fetchFn, calls };
}

describe("HaveIBeenPwnedChecker", () => {
  it("solo envía los 5 primeros caracteres del hash: nunca la contraseña ni el hash completo (k-anonimato)", async () => {
    // Aquí no vale "password": esa palabra forma parte del dominio del propio servicio (api.pwnedpasswords.com).
    const secret = "la batalla de alesia";
    const hash = createHash("sha1").update(secret).digest("hex").toUpperCase();
    const { fetchFn, calls } = fakeFetch("");

    await new HaveIBeenPwnedChecker(fetchFn).isBreached(secret);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
    expect(JSON.stringify(calls[0])).not.toContain(secret);
    expect(JSON.stringify(calls[0])).not.toContain(hash.slice(5));
  });

  it("calcula el prefijo del SHA-1 correctamente", async () => {
    const { fetchFn, calls } = fakeFetch("");

    await new HaveIBeenPwnedChecker(fetchFn).isBreached(PASSWORD);

    expect(calls[0].url).toBe(`https://api.pwnedpasswords.com/range/${PREFIX}`);
  });

  it("pide respuestas con relleno, para que su tamaño no delate el prefijo", async () => {
    const { fetchFn, calls } = fakeFetch("");

    await new HaveIBeenPwnedChecker(fetchFn).isBreached(PASSWORD);

    expect(new Headers(calls[0].init?.headers).get("Add-Padding")).toBe("true");
  });

  it("la contraseña está filtrada si su sufijo aparece en la respuesta", async () => {
    const { fetchFn } = fakeFetch(`0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n${SUFFIX}:10434004\r\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2`);

    expect(await new HaveIBeenPwnedChecker(fetchFn).isBreached(PASSWORD)).toBe(true);
  });

  it("no está filtrada si su sufijo no aparece", async () => {
    const { fetchFn } = fakeFetch("0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2");

    expect(await new HaveIBeenPwnedChecker(fetchFn).isBreached(PASSWORD)).toBe(false);
  });

  it("ignora las líneas de relleno (las que tienen 0 apariciones)", async () => {
    const { fetchFn } = fakeFetch(`${SUFFIX}:0`);

    expect(await new HaveIBeenPwnedChecker(fetchFn).isBreached(PASSWORD)).toBe(false);
  });

  it("si el servicio responde con un error, lo lanza (el caso de uso decide qué hacer)", async () => {
    const { fetchFn } = fakeFetch("Service Unavailable", 503);

    await expect(new HaveIBeenPwnedChecker(fetchFn).isBreached(PASSWORD)).rejects.toThrow();
  });
});
