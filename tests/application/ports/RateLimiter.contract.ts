import { describe, expect, it } from "vitest";
import type { Clock } from "@/application/ports/Clock";
import type { RateLimiter, RateLimitPolicy } from "@/application/ports/RateLimiter";

class ManualClock implements Clock {
  private current = new Date("2026-10-22T10:00:00Z");

  now(): Date {
    return new Date(this.current);
  }

  advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}

// Contract every RateLimiter must pass (in-memory today, Redis or PostgreSQL when deployed).
export function describeRateLimiterContract(
  name: string,
  createLimiter: (policy: RateLimitPolicy, clock: Clock) => RateLimiter | Promise<RateLimiter>,
) {
  describe(`${name} cumple el contrato de RateLimiter`, () => {
    const policy: RateLimitPolicy = { limit: 3, windowMs: 60_000 };

    it("permite peticiones hasta llegar al límite", async () => {
      const limiter = await createLimiter(policy, new ManualClock());

      for (let attempt = 0; attempt < 3; attempt++) {
        expect((await limiter.consume("visitante-1")).allowed).toBe(true);
      }
    });

    it("rechaza la petición que supera el límite e indica cuánto esperar", async () => {
      const clock = new ManualClock();
      const limiter = await createLimiter(policy, clock);
      await limiter.consume("visitante-1");
      clock.advance(10_000);
      await limiter.consume("visitante-1");
      await limiter.consume("visitante-1");

      // The oldest request (t=0) frees its slot at t=60s; we are at t=10s → 50s to wait.
      expect(await limiter.consume("visitante-1")).toEqual({ allowed: false, retryAfterSeconds: 50 });
    });

    it("cuenta por separado a cada visitante", async () => {
      const limiter = await createLimiter(policy, new ManualClock());
      for (let attempt = 0; attempt < 3; attempt++) await limiter.consume("visitante-1");

      expect((await limiter.consume("visitante-2")).allowed).toBe(true);
    });

    it("vuelve a permitir peticiones cuando pasa la ventana de tiempo", async () => {
      const clock = new ManualClock();
      const limiter = await createLimiter(policy, clock);
      for (let attempt = 0; attempt < 3; attempt++) await limiter.consume("visitante-1");

      clock.advance(60_000);

      expect((await limiter.consume("visitante-1")).allowed).toBe(true);
    });

    it("la ventana es deslizante: cada petición caduca por separado", async () => {
      const clock = new ManualClock();
      const limiter = await createLimiter(policy, clock);
      await limiter.consume("visitante-1"); // t=0
      clock.advance(30_000);
      await limiter.consume("visitante-1"); // t=30s
      await limiter.consume("visitante-1"); // t=30s
      clock.advance(30_000); // t=60s: only the first one has expired

      expect((await limiter.consume("visitante-1")).allowed).toBe(true);
      expect((await limiter.consume("visitante-1")).allowed).toBe(false);
    });

    it("las peticiones rechazadas no consumen cupo", async () => {
      const clock = new ManualClock();
      const limiter = await createLimiter(policy, clock);
      for (let attempt = 0; attempt < 3; attempt++) await limiter.consume("visitante-1");
      for (let attempt = 0; attempt < 10; attempt++) await limiter.consume("visitante-1"); // all rejected

      clock.advance(60_000);

      expect((await limiter.consume("visitante-1")).allowed).toBe(true);
    });
  });
}
