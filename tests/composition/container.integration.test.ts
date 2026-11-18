import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { closeContainer, getContainer, QUIZ_ANSWER_RATE_LIMIT } from "@/composition/container";
import { InvalidEnvironmentError } from "@/composition/env";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { resetDatabase } from "../infrastructure/persistence/postgres/testDatabase";
import { testDatabaseUrl } from "../infrastructure/persistence/postgres/testDatabaseUrl";

// Los comentarios necesitan sesión, que solo existe dentro de una petición real de Next.js: ese camino lo
// cubren BetterAuthService.integration.test.ts (sesiones contra PostgreSQL) y los tests end-to-end.
const globalWithState = globalThis as typeof globalThis & { __memnonState?: unknown; __memnonDatabase?: unknown };

// getContainer() es lo que usa la app: tiene que leer y escribir en PostgreSQL (DATABASE_URL apunta aquí a
// la base de datos de test) y compartir su estado y su conexión entre llamadas.
describe("getContainer (PostgreSQL)", () => {
  beforeEach(async () => {
    await closeContainer();
    process.env.DATABASE_URL = testDatabaseUrl();
    await resetDatabase(SEED);
  });

  afterAll(() => closeContainer());

  it("lee los temas de PostgreSQL", async () => {
    const overview = await getContainer().listTopicsByEra.execute("ROMAN");

    expect(overview.totalTopics).toBe(SEED.topics.filter((topic) => topic.era === "ROMAN").length);
  });

  it("carga el detalle completo de un tema, con su quiz sin soluciones", async () => {
    const result = await getContainer().getTopicDetail.execute("julio-cesar");

    expect(result.success && result.data.relatedTopics.map((topic) => topic.slug)).toEqual([
      "la-republica-romana",
      "asedio-de-alesia",
      "el-imperio-romano",
    ]);
    expect(result.success && result.data.quiz?.questions[0]).not.toHaveProperty("correctOptionIndex");
  });

  it("corrige el quiz con las respuestas guardadas en PostgreSQL", async () => {
    const result = await getContainer().answerQuizQuestion.execute(
      { topicSlug: "julio-cesar", questionId: "question-caesar-rubicon", optionIndex: 1 },
      "visitante-1",
    );

    expect(result.success && result.data.isCorrect).toBe(true);
  });

  it("mantiene los contadores del rate limiting entre llamadas", async () => {
    const answer = { topicSlug: "julio-cesar", questionId: "question-caesar-rubicon", optionIndex: 1 };
    for (let attempt = 0; attempt < QUIZ_ANSWER_RATE_LIMIT.limit; attempt++) {
      await getContainer().answerQuizQuestion.execute(answer, "visitante-limite");
    }

    const next = await getContainer().answerQuizQuestion.execute(answer, "visitante-limite");

    expect(!next.success && next.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("crea casos de uso nuevos en cada llamada (el código actualizado se aplica sin reiniciar)", () => {
    expect(getContainer().getTopicDetail).not.toBe(getContainer().getTopicDetail);
  });

  it("reconstruye el estado si se creó con clases anteriores a una recarga en caliente", async () => {
    // Simula instancias creadas antes de una recarga en caliente: la misma forma, pero no de las clases actuales.
    globalWithState.__memnonState = {
      clock: { now: () => new Date() },
      repositories: { topics: { findBySlug: () => Promise.resolve(null) } },
      rateLimiters: {},
    };

    const overview = await getContainer().listTopicsByEra.execute("ROMAN");

    expect(overview.totalTopics).toBeGreaterThan(0);
  });

  it("al reconstruir el estado reutiliza la misma conexión (no abre conexiones nuevas en cada recarga)", () => {
    getContainer();
    const connection = globalWithState.__memnonDatabase;
    globalWithState.__memnonState = undefined;

    getContainer();

    expect(globalWithState.__memnonDatabase).toBe(connection);
  });

  it("falla con un error claro si DATABASE_URL no es válida", () => {
    process.env.DATABASE_URL = "no-es-una-url";

    expect(() => getContainer()).toThrow(InvalidEnvironmentError);
  });
});
