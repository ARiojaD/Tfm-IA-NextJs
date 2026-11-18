import { afterAll, describe, expect, it } from "vitest";
import type { Clock } from "@/application/ports/Clock";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { PostgresRateLimiter } from "@/infrastructure/persistence/postgres/PostgresRateLimiter";
import { rateLimitHits } from "@/infrastructure/persistence/postgres/schema";
import { describeRateLimiterContract } from "../../../application/ports/RateLimiter.contract";
import { resetDatabase, testDb } from "./testDatabase";
import { testDatabaseUrl } from "./testDatabaseUrl";

const fixedClock: Clock = { now: () => new Date("2026-11-18T10:00:00Z") };
const policy = { limit: 3, windowMs: 60_000 };

describeRateLimiterContract("PostgresRateLimiter", async (contractPolicy, clock) => {
  await resetDatabase();
  return new PostgresRateLimiter(testDb, "contrato", contractPolicy, clock);
});

describe("PostgresRateLimiter, compartido entre instancias", () => {
  it("dos instancias con el mismo nombre llevan la misma cuenta (dos servidores de Vercel)", async () => {
    await resetDatabase();
    const first = new PostgresRateLimiter(testDb, "comentarios", policy, fixedClock);
    const second = new PostgresRateLimiter(testDb, "comentarios", policy, fixedClock);

    await first.consume("user:1");
    await second.consume("user:1");
    await first.consume("user:1");

    expect((await second.consume("user:1")).allowed).toBe(false);
  });

  it("limitadores con nombres distintos no se mezclan aunque la clave sea la misma", async () => {
    await resetDatabase();
    const comments = new PostgresRateLimiter(testDb, "comentarios", policy, fixedClock);
    for (let attempt = 0; attempt < 3; attempt++) await comments.consume("user:1");

    expect((await new PostgresRateLimiter(testDb, "quiz", policy, fixedClock).consume("user:1")).allowed).toBe(true);
  });

  it("no guarda la clave en claro: puede llevar un correo", async () => {
    await resetDatabase();
    await new PostgresRateLimiter(testDb, "inicio-sesion", policy, fixedClock).consume("email:livia@example.com");

    const rows = await testDb.select().from(rateLimitHits);
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toContain("livia");
  });

  it("con peticiones simultáneas desde varias conexiones no se pasa del límite", async () => {
    await resetDatabase();
    const pool = createDatabase(testDatabaseUrl(), { maxConnections: 5 });
    afterAll(() => pool.close());
    const limiter = new PostgresRateLimiter(pool.db, "simultaneas", policy, fixedClock);

    const decisions = await Promise.all(Array.from({ length: 10 }, () => limiter.consume("user:1")));

    expect(decisions.filter((decision) => decision.allowed)).toHaveLength(3);
  });
});
