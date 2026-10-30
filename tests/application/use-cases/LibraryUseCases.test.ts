import { beforeEach, describe, expect, it } from "vitest";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidLibraryRequestError } from "@/application/errors/InvalidLibraryRequestError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AuthenticatedUser } from "@/application/ports/AuthService";
import type { Clock } from "@/application/ports/Clock";
import { GetLibraryStatusUseCase } from "@/application/use-cases/GetLibraryStatusUseCase";
import { GetMyLibraryUseCase } from "@/application/use-cases/GetMyLibraryUseCase";
import { UpdateEraFollowUseCase } from "@/application/use-cases/UpdateEraFollowUseCase";
import { UpdateSavedTopicUseCase } from "@/application/use-cases/UpdateSavedTopicUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryLibraryRepository } from "@/infrastructure/persistence/in-memory/InMemoryLibraryRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", period: { start: { year: -100 } } });
const alesia = aTopic({
  id: "topic-alesia",
  slug: "asedio-de-alesia",
  title: "Asedio de Alesia",
  category: "WARS_AND_BATTLES",
  period: { start: { year: -52 } },
});
const pericles = aTopic({ id: "topic-pericles", slug: "pericles", title: "Pericles", era: "ANCIENT_GREECE" });

const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };
const marco = { name: "Marco", email: "marco@example.com", password: "el cruce del rubicon" };
const LIBRARY_LIMIT = 3;

// A clock that moves forward one minute on every call, so each saved topic gets a later date.
function steppingClock(): Clock {
  let minutes = 0;
  return { now: () => new Date(Date.UTC(2026, 9, 30, 10, minutes++)) };
}

describe("Mi biblioteca", () => {
  let topics: InMemoryTopicRepository;
  let library: InMemoryLibraryRepository;
  let auth: InMemoryAuthService;
  let user: AuthenticatedUser;
  let updateEraFollow: UpdateEraFollowUseCase;
  let updateSavedTopic: UpdateSavedTopicUseCase;
  let getLibraryStatus: GetLibraryStatusUseCase;
  let getMyLibrary: GetMyLibraryUseCase;

  beforeEach(async () => {
    topics = new InMemoryTopicRepository([caesar, alesia, pericles]);
    library = new InMemoryLibraryRepository();
    auth = new InMemoryAuthService();
    const registered = await auth.register(livia);
    user = registered.ok ? registered.user : { id: "", name: "" };
    const clock = steppingClock();
    // Its own frozen clock: with the stepping one, every attempt would fall in a new window.
    const frozenClock: Clock = { now: () => new Date("2026-10-30T10:00:00Z") };
    const rateLimiter = new InMemoryRateLimiter({ limit: LIBRARY_LIMIT, windowMs: 60_000 }, frozenClock);
    updateEraFollow = new UpdateEraFollowUseCase({ library, auth, rateLimiter });
    updateSavedTopic = new UpdateSavedTopicUseCase({ topics, library, auth, clock, rateLimiter });
    getLibraryStatus = new GetLibraryStatusUseCase({ library, auth });
    getMyLibrary = new GetMyLibraryUseCase({ topics, library, auth });
  });

  describe("UpdateEraFollowUseCase", () => {
    it("sigue una civilización", async () => {
      const result = await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });

      expect(result).toEqual({ success: true, data: { era: "ROMAN", following: true } });
      expect(await library.listFollowedEras(user.id)).toEqual(["ROMAN"]);
    });

    it("deja de seguir una civilización", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });

      const result = await updateEraFollow.execute({ era: "ROMAN", intent: "unfollow" });

      expect(result).toEqual({ success: true, data: { era: "ROMAN", following: false } });
      expect(await library.listFollowedEras(user.id)).toEqual([]);
    });

    it("pedir dos veces seguir deja la civilización seguida (un doble clic no la quita)", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });

      expect(await library.listFollowedEras(user.id)).toEqual(["ROMAN"]);
    });

    it("sin sesión iniciada no se puede seguir, y no se guarda nada", async () => {
      await auth.signOut();

      const result = await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
    });

    it.each([
      ["una civilización desconocida", { era: "EGYPT", intent: "follow" }],
      ["una intención desconocida", { era: "ROMAN", intent: "toggle" }],
      ["un usuario en la entrada (Mass Assignment)", { era: "ROMAN", intent: "follow", userId: "otra-persona" }],
      ["una entrada que no es un objeto", "ROMAN"],
    ])("rechaza %s", async (_case, input) => {
      const result = await updateEraFollow.execute(input);

      expect(!result.success && result.error).toBeInstanceOf(InvalidLibraryRequestError);
      expect(await library.listFollowedEras(user.id)).toEqual([]);
    });

    it("la biblioteca es la del usuario de la sesión: no toca la de otros", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
      const other = await auth.register(marco);

      await updateEraFollow.execute({ era: "HISPANIA", intent: "follow" });

      expect(await library.listFollowedEras(user.id)).toEqual(["ROMAN"]);
      expect(other.ok && (await library.listFollowedEras(other.user.id))).toEqual(["HISPANIA"]);
    });
  });

  describe("UpdateSavedTopicUseCase", () => {
    it("guarda un tema", async () => {
      const result = await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });

      expect(result).toEqual({ success: true, data: { topicId: "topic-caesar", saved: true } });
      expect(await library.listSavedTopicIds(user.id)).toEqual(["topic-caesar"]);
    });

    it("quita un tema guardado", async () => {
      await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });

      const result = await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "remove" });

      expect(result).toEqual({ success: true, data: { topicId: "topic-caesar", saved: false } });
      expect(await library.listSavedTopicIds(user.id)).toEqual([]);
    });

    it("sin sesión iniciada no se puede guardar", async () => {
      await auth.signOut();

      const result = await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
    });

    it("devuelve tema no encontrado si el tema no existe, sin guardar nada", async () => {
      const result = await updateSavedTopic.execute({ topicSlug: "augusto", intent: "save" });

      expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
      expect(await library.listSavedTopicIds(user.id)).toEqual([]);
    });

    it.each([
      ["un slug mal formado", { topicSlug: "../admin", intent: "save" }],
      ["una intención desconocida", { topicSlug: "julio-cesar", intent: "toggle" }],
      ["un usuario en la entrada (Mass Assignment)", { topicSlug: "julio-cesar", intent: "save", userId: "otra" }],
      ["una entrada vacía", null],
    ])("rechaza %s", async (_case, input) => {
      const result = await updateSavedTopic.execute(input);

      expect(!result.success && result.error).toBeInstanceOf(InvalidLibraryRequestError);
      expect(await library.listSavedTopicIds(user.id)).toEqual([]);
    });
  });

  describe("límite de frecuencia (OWASP API4)", () => {
    it("seguir y guardar comparten el límite del usuario, y cuentan también los intentos inválidos", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
      await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });
      await updateEraFollow.execute({ era: "EGYPT", intent: "follow" });

      const blocked = await updateSavedTopic.execute({ topicSlug: "asedio-de-alesia", intent: "save" });

      expect(!blocked.success && blocked.error).toBeInstanceOf(RateLimitExceededError);
      expect(await library.listSavedTopicIds(user.id)).toEqual(["topic-caesar"]);
    });

    it("el límite es por usuario: otro usuario puede seguir usando su biblioteca", async () => {
      for (let attempt = 0; attempt < LIBRARY_LIMIT; attempt++) {
        await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
      }
      await auth.register(marco);

      const result = await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });

      expect(result.success).toBe(true);
    });
  });

  describe("GetLibraryStatusUseCase", () => {
    it("devuelve las civilizaciones seguidas y los temas guardados del usuario", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
      await updateSavedTopic.execute({ topicSlug: "pericles", intent: "save" });

      expect(await getLibraryStatus.execute()).toEqual({ followedEras: ["ROMAN"], savedTopicIds: ["topic-pericles"] });
    });

    it("devuelve null sin sesión: la interfaz muestra los botones que llevan a iniciar sesión", async () => {
      await auth.signOut();

      expect(await getLibraryStatus.execute()).toBeNull();
    });
  });

  describe("GetMyLibraryUseCase", () => {
    it("sin sesión iniciada pide iniciar sesión", async () => {
      await auth.signOut();

      const result = await getMyLibrary.execute();

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
    });

    it("una biblioteca nueva está vacía", async () => {
      expect(await getMyLibrary.execute()).toEqual({ success: true, data: { followedEras: [], savedTopics: [] } });
    });

    it("cada civilización seguida trae todos sus temas en orden cronológico", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });

      const result = await getMyLibrary.execute();

      expect(result.success && result.data.followedEras).toEqual([{ era: "ROMAN", topics: [caesar, alesia] }]);
    });

    it("una civilización seguida trae también los temas que se añadan después", async () => {
      await updateEraFollow.execute({ era: "ANCIENT_GREECE", intent: "follow" });
      const marathon = aTopic({ id: "topic-marathon", slug: "maraton", title: "Maratón", era: "ANCIENT_GREECE" });
      topics = new InMemoryTopicRepository([caesar, alesia, pericles, marathon]);
      getMyLibrary = new GetMyLibraryUseCase({ topics, library, auth });

      const result = await getMyLibrary.execute();

      expect(result.success && result.data.followedEras[0].topics.map((topic) => topic.slug)).toEqual([
        "maraton",
        "pericles",
      ]);
    });

    it("las civilizaciones siguen el orden fijo de la portada, no el orden en que se siguieron", async () => {
      await updateEraFollow.execute({ era: "ROMAN", intent: "follow" });
      await updateEraFollow.execute({ era: "ANCIENT_GREECE", intent: "follow" });

      const result = await getMyLibrary.execute();

      expect(result.success && result.data.followedEras.map((group) => group.era)).toEqual(["ANCIENT_GREECE", "ROMAN"]);
    });

    it("los temas guardados van del más reciente al más antiguo", async () => {
      await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });
      await updateSavedTopic.execute({ topicSlug: "pericles", intent: "save" });

      const result = await getMyLibrary.execute();

      expect(result.success && result.data.savedTopics).toEqual([pericles, caesar]);
    });

    it("omite los temas guardados que ya no existen", async () => {
      await library.saveTopic(user.id, "topic-borrado", new Date("2026-10-30T09:00:00Z"));
      await updateSavedTopic.execute({ topicSlug: "julio-cesar", intent: "save" });

      const result = await getMyLibrary.execute();

      expect(result.success && result.data.savedTopics).toEqual([caesar]);
    });
  });
});
