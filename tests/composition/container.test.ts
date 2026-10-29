import { describe, expect, it } from "vitest";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { createContainer, SIGN_IN_RATE_LIMIT } from "@/composition/container";

const VISITOR = "visitante-1";
const comment = { topicSlug: "julio-cesar", author: "Livia", message: "Hola" };

// createContainer(): the in-memory wiring the unit tests use. getContainer(), the one the app uses, runs
// against PostgreSQL and is tested in container.integration.test.ts.
describe("createContainer (en memoria)", () => {
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

  it("conecta el registro, el usuario actual, el cierre y el inicio de sesión", async () => {
    const container = createContainer();
    const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

    const registered = await container.registerUser.execute(livia, VISITOR);
    expect(await container.getCurrentUser.execute()).toEqual(registered.success && registered.data);

    await container.signOut.execute();
    expect(await container.getCurrentUser.execute()).toBeNull();

    const signedIn = await container.signIn.execute({ email: livia.email, password: livia.password }, VISITOR);
    expect(signedIn.success && signedIn.data.name).toBe("Livia");
  });

  it("limita los intentos de inicio de sesión de un visitante", async () => {
    const container = createContainer();
    const wrong = { email: "livia@example.com", password: "no es la contraseña" };
    for (let attempt = 0; attempt < SIGN_IN_RATE_LIMIT.limit; attempt++) await container.signIn.execute(wrong, VISITOR);

    const next = await container.signIn.execute(wrong, VISITOR);

    expect(!next.success && next.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("conecta ListTopicsByEra: el asedio de Alesia aparece en las guerras y batallas de Roma", async () => {
    const overview = await createContainer().listTopicsByEra.execute("ROMAN");

    const battles = overview.categories.find((group) => group.category === "WARS_AND_BATTLES");
    expect(battles?.topics.map((topic) => topic.slug)).toEqual(["asedio-de-alesia"]);
  });
});
