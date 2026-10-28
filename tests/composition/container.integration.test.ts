import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { closeContainer, getContainer } from "@/composition/container";
import { InvalidEnvironmentError } from "@/composition/env";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { PostgresCommentRepository } from "@/infrastructure/persistence/postgres/PostgresCommentRepository";
import { resetDatabase, testDb } from "../infrastructure/persistence/postgres/testDatabase";
import { testDatabaseUrl } from "../infrastructure/persistence/postgres/testDatabaseUrl";

const comment = { topicSlug: "julio-cesar", author: "Livia", message: "Hola desde PostgreSQL" };
const globalWithState = globalThis as typeof globalThis & { __memnonState?: unknown; __memnonDatabase?: unknown };

// getContainer() is what the app uses: it must read and write PostgreSQL (DATABASE_URL points to the
// test database here), and share its state and connection between calls.
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

    expect(result.success && result.data.relatedTopics.map((topic) => topic.slug)).toEqual(["asedio-de-alesia"]);
    expect(result.success && result.data.quiz?.questions[0]).not.toHaveProperty("correctOptionIndex");
  });

  it("guarda los comentarios en PostgreSQL", async () => {
    const added = await getContainer().addComment.execute(comment, "visitante-1");

    const stored = await new PostgresCommentRepository(testDb).listByTopic("topic-julius-caesar");
    expect(stored).toContainEqual(added.success && added.data);
  });

  it("corrige el quiz con las respuestas guardadas en PostgreSQL", async () => {
    const result = await getContainer().answerQuizQuestion.execute(
      { topicSlug: "julio-cesar", questionId: "question-caesar-rubicon", optionIndex: 1 },
      "visitante-1",
    );

    expect(result.success && result.data.isCorrect).toBe(true);
  });

  it("mantiene el contador del límite de comentarios entre llamadas", async () => {
    for (let attempt = 0; attempt < 5; attempt++) await getContainer().addComment.execute(comment, "visitante-limite");

    const sixth = await getContainer().addComment.execute(comment, "visitante-limite");

    expect(!sixth.success && sixth.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("crea casos de uso nuevos en cada llamada (el código actualizado se aplica sin reiniciar)", () => {
    expect(getContainer().getTopicDetail).not.toBe(getContainer().getTopicDetail);
  });

  it("reconstruye el estado si se creó con clases anteriores a una recarga en caliente", async () => {
    // Simulates instances built before a hot reload: same shape, but not of the current classes.
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
