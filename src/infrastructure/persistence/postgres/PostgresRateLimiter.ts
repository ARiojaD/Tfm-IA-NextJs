import { createHash } from "node:crypto";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import type { Clock } from "@/application/ports/Clock";
import type { RateLimitDecision, RateLimiter, RateLimitPolicy } from "@/application/ports/RateLimiter";
import type { Database } from "./client";
import { rateLimitHits } from "./schema";

// La misma ventana deslizante que InMemoryRateLimiter, pero en PostgreSQL: todas las instancias del
// servidor comparten la cuenta. Cada límite tiene su nombre (comentarios, inicio de sesión…), así que la
// misma clave no se mezcla entre límites.
export class PostgresRateLimiter implements RateLimiter {
  constructor(
    private readonly db: Database,
    private readonly name: string,
    private readonly policy: RateLimitPolicy,
    private readonly clock: Clock,
  ) {}

  consume(key: string): Promise<RateLimitDecision> {
    const now = this.clock.now();
    const windowStart = new Date(now.getTime() - this.policy.windowMs);
    const keyHash = createHash("sha256").update(key).digest("hex");

    return this.db.transaction(async (tx) => {
      // Un cerrojo por clave mientras dura la transacción: dos peticiones simultáneas no pueden leer el
      // mismo recuento y colarse las dos por el último hueco.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${this.name}:${keyHash}`}, 0))`);
      // Lo que ya salió de la ventana sobra, de esta clave y de cualquier otra de este límite: así la tabla
      // no crece.
      await tx.delete(rateLimitHits).where(and(eq(rateLimitHits.limiter, this.name), lte(rateLimitHits.at, windowStart)));

      const recent = await tx
        .select({ at: rateLimitHits.at })
        .from(rateLimitHits)
        .where(and(eq(rateLimitHits.limiter, this.name), eq(rateLimitHits.keyHash, keyHash)))
        .orderBy(asc(rateLimitHits.at))
        .limit(this.policy.limit);

      if (recent.length >= this.policy.limit) {
        const oldestExpiresAt = recent[0].at.getTime() + this.policy.windowMs;
        return { allowed: false, retryAfterSeconds: Math.ceil((oldestExpiresAt - now.getTime()) / 1000) };
      }

      await tx.insert(rateLimitHits).values({ limiter: this.name, keyHash, at: now });
      return { allowed: true };
    });
  }
}
