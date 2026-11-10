import { describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { createContainer, LIBRARY_RATE_LIMIT, QUESTION_RATE_LIMIT, SIGN_IN_RATE_LIMIT } from "@/composition/container";

const VISITOR = "visitante-1";
const comment = { topicSlug: "julio-cesar", message: "Hola" };
const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

// A container with Livia signed in (comments require a session).
async function containerWithLivia() {
  const container = createContainer();
  await container.registerUser.execute(livia, VISITOR);
  return container;
}

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
    const container = await containerWithLivia();

    const added = await container.addComment.execute(comment);
    const detail = await container.getTopicDetail.execute("julio-cesar");

    expect(added.success && added.data.author).toBe("Livia");
    expect(detail.success && detail.data.comments[0]).toEqual(added.success && added.data);
  });

  it("AddComment usa la misma sesión que el registro: sin sesión, no se comenta", async () => {
    const container = await containerWithLivia();
    await container.signOut.execute();

    const result = await container.addComment.execute(comment);

    expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
  });

  it("cada container nuevo empieza con los datos de ejemplo, sin cambios de otros", async () => {
    await (await containerWithLivia()).addComment.execute(comment);

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

  it("limita cada usuario a 5 comentarios por minuto", async () => {
    const container = await containerWithLivia();
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await container.addComment.execute(comment)).success).toBe(true);
    }

    const sixth = await container.addComment.execute(comment);

    expect(!sixth.success && sixth.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("conecta el registro, el usuario actual, el cierre y el inicio de sesión", async () => {
    const container = createContainer();
    const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };

    const registered = await container.registerUser.execute(livia, VISITOR);
    expect(await container.getCurrentUser.execute()).toEqual(registered.success && { ...registered.data, isAdmin: false });

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

  it("conecta Mi biblioteca: seguir Roma trae sus temas y guardar un tema lo añade", async () => {
    const container = await containerWithLivia();

    await container.updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
    await container.updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });
    const library = await container.getMyLibrary.execute();

    expect(library.success && library.data.followedEras[0].topics.map((topic) => topic.slug)).toEqual([
      "julio-cesar",
      "asedio-de-alesia",
    ]);
    expect(library.success && library.data.savedTopics.map((topic) => topic.slug)).toEqual(["julio-cesar"]);
    expect(await container.getLibraryStatus.execute()).toEqual({
      followedEras: ["ROMAN"],
      savedTopicIds: ["topic-julius-caesar"],
    });
  });

  it("limita cada usuario a 30 cambios por minuto en su biblioteca", async () => {
    const container = await containerWithLivia();
    for (let attempt = 0; attempt < LIBRARY_RATE_LIMIT.limit; attempt++) {
      await container.updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
    }

    const next = await container.updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });

    expect(LIBRARY_RATE_LIMIT.limit).toBe(30);
    expect(!next.success && next.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("una cuenta recién creada no es administradora y no puede entrar en el panel", async () => {
    const container = await containerWithLivia();

    const access = await container.getAdminAccess.execute();
    const topics = await container.listTopicsForAdmin.execute();

    expect(!access.success && access.error).toBeInstanceOf(AdminRequiredError);
    expect(!topics.success && topics.error).toBeInstanceOf(AdminRequiredError);
  });

  it("conecta ListTopicsByEra: el asedio de Alesia aparece en las guerras y batallas de Roma", async () => {
    const overview = await createContainer().listTopicsByEra.execute("ROMAN");

    const battles = overview.categories.find((group) => group.category === "WARS_AND_BATTLES");
    expect(battles?.topics.map((topic) => topic.slug)).toEqual(["asedio-de-alesia"]);
  });

  it("conecta el RAG: con el índice creado, una pregunta con sesión responde citando un tema", async () => {
    const container = await containerWithLivia();
    await container.rebuildKnowledgeIndex.execute();

    const result = await container.askEncyclopedia.execute({ question: "¿Cuándo cruzó César el Rubicón?" });

    expect(result.success && result.data.status).toBe("ANSWERED");
  });

  it("limita las preguntas al RAG por usuario", async () => {
    const container = await containerWithLivia();
    for (let i = 0; i < QUESTION_RATE_LIMIT.limit; i++) {
      await container.askEncyclopedia.execute({ question: "¿Cuándo?" });
    }

    const result = await container.askEncyclopedia.execute({ question: "¿Cuándo?" });

    expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
  });

  it("conecta el índice del RAG: lo rehace con todos los temas publicados del seed", async () => {
    const summary = await createContainer().rebuildKnowledgeIndex.execute();

    expect(summary.indexedTopics).toBeGreaterThanOrEqual(2);
    expect(summary.removedTopics).toBe(0);
    expect(summary.chunks).toBeGreaterThan(summary.indexedTopics);
  });
});
