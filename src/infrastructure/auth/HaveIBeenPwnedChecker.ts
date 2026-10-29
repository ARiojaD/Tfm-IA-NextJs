import { createHash } from "node:crypto";
import type { BreachedPasswordChecker } from "@/application/ports/BreachedPasswordChecker";

const RANGE_API = "https://api.pwnedpasswords.com/range";
const TIMEOUT_MS = 3_000;

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

// Checks passwords against Have I Been Pwned's public "Pwned Passwords" list using k-anonymity: only the
// first 5 characters of the password's SHA-1 hash leave the server. The service answers with every hash
// suffix that starts with them, and the match is done here. SHA-1 is only a lookup key for the service,
// never how we store passwords (that is Better Auth's scrypt).
export class HaveIBeenPwnedChecker implements BreachedPasswordChecker {
  constructor(private readonly fetchFn: FetchFn = fetch) {}

  async isBreached(password: string): Promise<boolean> {
    const hash = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await this.fetchFn(`${RANGE_API}/${prefix}`, {
      // Padding makes every response a similar size, so its length does not reveal the prefix.
      headers: { "Add-Padding": "true", "User-Agent": "MemnonHistory-TFM" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Have I Been Pwned respondió ${response.status}`);
    }

    // Each line is "SUFFIX:COUNT"; padding lines have a count of 0.
    return (await response.text()).split(/\r?\n/).some((line) => {
      const [candidate, count] = line.trim().split(":");
      return candidate === suffix && Number(count) > 0;
    });
  }
}
