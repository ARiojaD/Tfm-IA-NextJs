import { describe, expect, it } from "vitest";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { createContainer, getContainer } from "@/composition/container";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { SEED, type Seed } from "@/infrastructure/persistence/in-memory/seed";

const VISITOR = "visitante-1";
const comment = { topicSlug: "julio-cesar", author: "Livia", message: "Hola" };

describe("container", () => {
  it("conecta GetTopicDetail con los datos de ejemplo de Julio César", async () => {
    const result = await createContainer().getTopicDetail.execute("julio-cesar");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topic.title).toBe("Julio César");
    expect(result.data.events).toHaveLength(9);
    expect(result.data.quiz?.questions).toHaveLength(5);
    expect(result.data.recommendations).toHaveLength(6);
  });

  it("conecta ListTopicsByEra: Julio César aparece en los personajes de Roma", async () => {
    const overview = await createContainer().listTopicsByEra.execute("ROMAN");

    const people = overview.categories.find((group) => group.category === "PEOPLE");
    expect(people?.topics.map((topic) => topic.slug)).toContain("julio-cesar");
  });

  it("AddComment y GetTopicDetail comparten el mismo repositorio de comentarios", async () => {
    const container = createContainer();

    const added = await container.addComment.execute(comment, VISITOR);
    const detail = await container.getTopicDetail.execute("julio-cesar");

    expect(added.success).toBe(true);
    expect(detail.success && detail.data.comments[0]).toEqual(added.success && added.data);
  });

  it("cada container nuevo empieza con los datos de ejemplo, sin cambios de otros", async () => {
    await createContainer().addComment.execute(comment, VISITOR);

    const detail = await createContainer().getTopicDetail.execute("julio-cesar");

    expect(detail.success && detail.data.comments).toHaveLength(3);
  });

  it("conecta AnswerQuizQuestion con el quiz de Julio César", async () => {
    const result = await createContainer().answerQuizQuestion.execute(
      { topicSlug: "julio-cesar", questionId: "question-caesar-rubicon", optionIndex: 1 },
      VISITOR,
    );

    expect(result.success && result.data.isCorrect).toBe(true);
  });

  it("limita cada visitante a 5 comentarios por minuto", async () => {
    const container = createContainer();
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await container.addComment.execute(comment, VISITOR)).success).toBe(true);
    }

    const sixth = await container.addComment.execute(comment, VISITOR);

    expect(!sixth.success && sixth.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("getContainer comparte los mismos datos entre llamadas", async () => {
    const added = await getContainer().addComment.execute(comment, VISITOR);

    const detail = await getContainer().getTopicDetail.execute("julio-cesar");

    expect(detail.success && detail.data.comments[0]).toEqual(added.success && added.data);
  });

  it("getContainer mantiene el contador del límite entre llamadas", async () => {
    for (let attempt = 0; attempt < 5; attempt++) await getContainer().addComment.execute(comment, "visitante-limite");

    const sixth = await getContainer().addComment.execute(comment, "visitante-limite");

    expect(!sixth.success && sixth.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("getContainer reconstruye el estado si se creó con clases anteriores a una recarga en caliente", async () => {
    // Simulates instances built before a hot reload: same shape, but not of the current classes.
    const globalWithState = globalThis as typeof globalThis & { __memnonState?: unknown };
    globalWithState.__memnonState = {
      clock: { now: () => new Date() },
      repositories: { topics: { findBySlug: () => Promise.resolve(null) } },
      rateLimiters: {},
    };

    const overview = await getContainer().listTopicsByEra.execute("ROMAN");

    expect(overview.totalTopics).toBeGreaterThan(0);
  });

  it("getContainer reconstruye el estado si se creó con una versión anterior del seed", async () => {
    // Simulates a hot reload of the seed files: the stored state was built from an older SEED object.
    getContainer();
    const globalWithState = globalThis as typeof globalThis & {
      __memnonState?: { seed: Seed; repositories: { topics: InMemoryTopicRepository } };
    };
    globalWithState.__memnonState!.seed = { ...SEED, topics: [] };
    globalWithState.__memnonState!.repositories.topics = new InMemoryTopicRepository([]);

    const overview = await getContainer().listTopicsByEra.execute("ROMAN");

    expect(overview.totalTopics).toBe(SEED.topics.filter((topic) => topic.era === "ROMAN").length);
  });

  it("conecta ListTopicsByEra: el asedio de Alesia aparece en las guerras y batallas de Roma", async () => {
    const overview = await createContainer().listTopicsByEra.execute("ROMAN");

    const battles = overview.categories.find((group) => group.category === "WARS_AND_BATTLES");
    expect(battles?.topics.map((topic) => topic.slug)).toEqual(["asedio-de-alesia"]);
  });

  it("getContainer crea casos de uso nuevos en cada llamada (el código actualizado se aplica sin reiniciar)", () => {
    expect(getContainer().getTopicDetail).not.toBe(getContainer().getTopicDetail);
  });
});
