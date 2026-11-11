import { createHash } from "node:crypto";
import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";

const RANGE_API = "https://api.pwnedpasswords.com/range";
const TIMEOUT_MS = 3_000;

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

// Comprueba las contraseñas contra la lista pública "Pwned Passwords" de Have I Been Pwned con
// k-anonimato: del servidor solo salen los 5 primeros caracteres del hash SHA-1 de la contraseña. El
// servicio responde con todos los sufijos que empiezan así y la coincidencia se busca aquí. SHA-1 es solo
// la clave de búsqueda del servicio, nunca cómo se guardan las contraseñas (eso es el scrypt de Better
// Auth).
export class HaveIBeenPwnedChecker implements BreachedPasswordChecker {
  constructor(private readonly fetchFn: FetchFn = fetch) {}

  async isBreached(password: string): Promise<boolean> {
    const hash = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await this.fetchFn(`${RANGE_API}/${prefix}`, {
      // El relleno hace que todas las respuestas tengan un tamaño parecido, para que su longitud no
      // revele el prefijo.
      headers: { "Add-Padding": "true", "User-Agent": "MemnonHistory-TFM" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Have I Been Pwned respondió ${response.status}`);
    }

    // Cada línea es "SUFIJO:VECES"; las líneas de relleno tienen 0.
    return (await response.text()).split(/\r?\n/).some((line) => {
      const [candidate, count] = line.trim().split(":");
      return candidate === suffix && Number(count) > 0;
    });
  }
}
