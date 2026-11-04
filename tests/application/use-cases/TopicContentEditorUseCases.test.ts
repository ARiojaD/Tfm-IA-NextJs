import { beforeEach, describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { Clock } from "@/application/ports/Clock";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import { GetTopicForEditingUseCase } from "@/application/use-cases/GetTopicForEditingUseCase";
import { UpdateRelatedTopicsUseCase } from "@/application/use-cases/UpdateRelatedTopicsUseCase";
import { UpdateTopicEventsUseCase } from "@/application/use-cases/UpdateTopicEventsUseCase";
import { UpdateTopicQuizUseCase } from "@/application/use-cases/UpdateTopicQuizUseCase";
import { UpdateTopicRecommendationsUseCase } from "@/application/use-cases/UpdateTopicRecommendationsUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { StaticImageCatalog } from "@/infrastructure/images/StaticImageCatalog";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aQuiz, aRecommendation, aTopic, anEvent } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", relatedTopicIds: ["topic-alesia"] });
const alesia = aTopic({ id: "topic-alesia", slug: "asedio-de-alesia", title: "Asedio de Alesia", relatedTopicIds: ["topic-caesar"] });
const viriato = aTopic({ id: "topic-viriato", slug: "viriato", title: "Viriato", era: "HISPANIA", status: "DRAFT" });

const rubicon = anEvent({ id: "event-rubicon", topicId: "topic-caesar", title: "Cruce del Rubicón" });
const marathon = anEvent({ id: "event-marathon", topicId: "topic-other", title: "Maratón" });
const caesarQuiz = aQuiz({ id: "quiz-caesar", topicId: "topic-caesar" });
const book = aRecommendation({ id: "rec-book", topicId: "topic-caesar", title: "Libro" });

const frozenClock: Clock = { now: () => new Date("2026-11-03T10:00:00Z") };

// What the forms send: the rows as the admin wrote them, years and months as text.
const eventRow = { id: "", title: "Batalla de Farsalia", year: "48", era: "BC", month: "8", description: "Derrota de Pompeyo." };
const questionRow = {
  id: "",
  question: "¿Qué río cruzó César?",
  options: ["Tíber", "Rubicón", "Ebro"],
  correctOptionIndex: 1,
  explanation: "",
};
const recommendationRow = { id: "", type: "FILM", title: "Julio César", creator: "Joseph L. Mankiewicz", year: "1953", description: "Con Marlon Brando." };

describe("Editor de temas: cronología, quiz, recomendaciones y relacionados", () => {
  let topics: InMemoryTopicRepository;
  let events: InMemoryHistoricalEventRepository;
  let quizzes: InMemoryQuizRepository;
  let recommendations: InMemoryRecommendationRepository;
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;
  let ids: IdGenerator;

  beforeEach(async () => {
    topics = new InMemoryTopicRepository([caesar, alesia, viriato]);
    events = new InMemoryHistoricalEventRepository([rubicon, marathon]);
    quizzes = new InMemoryQuizRepository([caesarQuiz]);
    recommendations = new InMemoryRecommendationRepository([book]);
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    let next = 0;
    ids = { generate: () => `new-${++next}` };
    const registered = await auth.register({ name: "Admin", email: "admin@example.com", password: "frase larga de la admin" });
    if (registered.ok) await roles.setRole(registered.user.id, "ADMIN");
  });

  const deps = () => ({
    topicEditor: topics,
    events,
    quizzes,
    recommendations,
    images: new StaticImageCatalog([]),
    auth,
    roles,
    ids,
    rateLimiter: new InMemoryRateLimiter({ limit: 100, windowMs: 60_000 }, frozenClock),
  });

  describe("UpdateTopicEventsUseCase", () => {
    it("guarda la cronología: conserva el id de los eventos del tema y da uno nuevo a los demás", async () => {
      const result = await new UpdateTopicEventsUseCase(deps()).execute({
        topicId: "topic-caesar",
        events: [{ ...eventRow, id: "event-rubicon", title: "Cruce del Rubicón (editado)" }, eventRow],
      });

      expect(result.success).toBe(true);
      expect(await events.listByTopic("topic-caesar")).toEqual([
        { id: "event-rubicon", topicId: "topic-caesar", title: "Cruce del Rubicón (editado)", date: { year: -48, month: 8 }, era: "ROMAN", description: "Derrota de Pompeyo." },
        { id: "new-1", topicId: "topic-caesar", title: "Batalla de Farsalia", date: { year: -48, month: 8 }, era: "ROMAN", description: "Derrota de Pompeyo." },
      ]);
    });

    it("no deja sobrescribir un evento de otro tema enviando su id: recibe un id nuevo", async () => {
      await new UpdateTopicEventsUseCase(deps()).execute({ topicId: "topic-caesar", events: [{ ...eventRow, id: "event-marathon" }] });

      expect((await events.listByTopic("topic-caesar")).map((event) => event.id)).toEqual(["new-1"]);
      expect(await events.listByTopic("topic-other")).toEqual([marathon]);
    });

    it("los eventos toman la civilización de su tema", async () => {
      await new UpdateTopicEventsUseCase(deps()).execute({ topicId: "topic-viriato", events: [eventRow] });

      expect((await events.listByTopic("topic-viriato"))[0].era).toBe("HISPANIA");
    });

    it("indica en qué evento está el error, sin guardar nada", async () => {
      const result = await new UpdateTopicEventsUseCase(deps()).execute({
        topicId: "topic-caesar",
        events: [eventRow, { ...eventRow, title: "", year: "0" }],
      });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors.events).toEqual([
        "Evento 2: escribe el título",
        "Evento 2: El año 0 no existe: al 1 a.C. le sigue el 1 d.C.",
      ]);
      expect(await events.listByTopic("topic-caesar")).toEqual([rubicon]);
    });

    it("una lista vacía deja el tema sin cronología", async () => {
      await new UpdateTopicEventsUseCase(deps()).execute({ topicId: "topic-caesar", events: [] });

      expect(await events.listByTopic("topic-caesar")).toEqual([]);
    });
  });

  describe("UpdateTopicQuizUseCase", () => {
    it("guarda las preguntas en orden, en el quiz que ya tenía el tema", async () => {
      await new UpdateTopicQuizUseCase(deps()).execute({
        topicId: "topic-caesar",
        questions: [questionRow, { ...questionRow, question: "¿Y el segundo?", explanation: "Porque sí." }],
      });

      expect(await quizzes.findByTopic("topic-caesar")).toEqual({
        id: "quiz-caesar",
        topicId: "topic-caesar",
        questions: [
          { id: "new-1", question: "¿Qué río cruzó César?", options: ["Tíber", "Rubicón", "Ebro"], correctOptionIndex: 1 },
          {
            id: "new-2",
            question: "¿Y el segundo?",
            options: ["Tíber", "Rubicón", "Ebro"],
            correctOptionIndex: 1,
            explanation: "Porque sí.",
          },
        ],
      });
    });

    it("conserva el id de las preguntas que ya eran del quiz", async () => {
      const existingId = caesarQuiz.questions[0].id;

      await new UpdateTopicQuizUseCase(deps()).execute({ topicId: "topic-caesar", questions: [{ ...questionRow, id: existingId }] });

      expect((await quizzes.findByTopic("topic-caesar"))?.questions[0].id).toBe(existingId);
    });

    it("crea el quiz de un tema que no tenía", async () => {
      await new UpdateTopicQuizUseCase(deps()).execute({ topicId: "topic-viriato", questions: [questionRow] });

      expect(await quizzes.findByTopic("topic-viriato")).toMatchObject({ id: "new-1", topicId: "topic-viriato" });
    });

    it("sin preguntas, el tema se queda sin quiz", async () => {
      await new UpdateTopicQuizUseCase(deps()).execute({ topicId: "topic-caesar", questions: [] });

      expect(await quizzes.findByTopic("topic-caesar")).toBeNull();
    });

    it.each([
      ["opciones repetidas", { options: ["Tíber", "Tíber"], correctOptionIndex: 0 }, "Pregunta 1: Las opciones de una pregunta no pueden repetirse"],
      ["una respuesta correcta que no es una opción", { correctOptionIndex: 3 }, "Pregunta 1: La respuesta correcta debe ser una de las opciones"],
      ["una sola opción", { options: ["Tíber"], correctOptionIndex: 0 }, "Pregunta 1: pon al menos 2 opciones"],
      ["más de 4 opciones", { options: ["A", "B", "C", "D", "E"] }, "Pregunta 1: como máximo 4 opciones"],
    ])("rechaza %s, sin tocar el quiz", async (_case, overrides, message) => {
      const result = await new UpdateTopicQuizUseCase(deps()).execute({ topicId: "topic-caesar", questions: [{ ...questionRow, ...overrides }] });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors.questions).toEqual([message]);
      expect(await quizzes.findByTopic("topic-caesar")).toEqual(caesarQuiz);
    });
  });

  describe("UpdateTopicRecommendationsUseCase", () => {
    it("guarda las recomendaciones del tema", async () => {
      await new UpdateTopicRecommendationsUseCase(deps()).execute({
        topicId: "topic-caesar",
        recommendations: [{ ...recommendationRow, id: "rec-book", type: "BOOK", title: "Libro (editado)" }, recommendationRow],
      });

      expect(await recommendations.listByTopic("topic-caesar")).toEqual([
        { id: "rec-book", topicId: "topic-caesar", type: "BOOK", title: "Libro (editado)", creator: "Joseph L. Mankiewicz", year: 1953, description: "Con Marlon Brando." },
        { id: "new-1", topicId: "topic-caesar", type: "FILM", title: "Julio César", creator: "Joseph L. Mankiewicz", year: 1953, description: "Con Marlon Brando." },
      ]);
    });

    it("rechaza un tipo desconocido indicando la recomendación", async () => {
      const result = await new UpdateTopicRecommendationsUseCase(deps()).execute({
        topicId: "topic-caesar",
        recommendations: [{ ...recommendationRow, type: "PODCAST" }],
      });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors.recommendations).toEqual([
        "Recomendación 1: elige el tipo",
      ]);
    });
  });

  describe("UpdateRelatedTopicsUseCase", () => {
    it("relaciona los temas en los dos sentidos", async () => {
      await new UpdateRelatedTopicsUseCase(deps()).execute({ topicId: "topic-viriato", relatedTopicIds: ["topic-caesar"] });

      expect((await topics.findById("topic-viriato"))?.relatedTopicIds).toEqual(["topic-caesar"]);
      expect((await topics.findById("topic-caesar"))?.relatedTopicIds).toContain("topic-viriato");
    });

    it("rechaza relacionar un tema consigo mismo", async () => {
      const result = await new UpdateRelatedTopicsUseCase(deps()).execute({ topicId: "topic-caesar", relatedTopicIds: ["topic-caesar"] });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors.relatedTopicIds).toEqual([
        "Un tema no puede estar relacionado consigo mismo",
      ]);
    });

    it("rechaza un tema que no existe, sin cambiar nada", async () => {
      const result = await new UpdateRelatedTopicsUseCase(deps()).execute({ topicId: "topic-caesar", relatedTopicIds: ["topic-missing"] });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
      expect((await topics.findById("topic-caesar"))?.relatedTopicIds).toEqual(["topic-alesia"]);
    });
  });

  describe("comunes", () => {
    it("un usuario normal no puede cambiar ninguna de las cuatro secciones", async () => {
      await auth.register({ name: "Lector", email: "lector@example.com", password: "frase larga del lector" });

      const results = await Promise.all([
        new UpdateTopicEventsUseCase(deps()).execute({ topicId: "topic-caesar", events: [] }),
        new UpdateTopicQuizUseCase(deps()).execute({ topicId: "topic-caesar", questions: [] }),
        new UpdateTopicRecommendationsUseCase(deps()).execute({ topicId: "topic-caesar", recommendations: [] }),
        new UpdateRelatedTopicsUseCase(deps()).execute({ topicId: "topic-caesar", relatedTopicIds: [] }),
      ]);

      for (const result of results) {
        expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
      }
      expect(await events.listByTopic("topic-caesar")).toEqual([rubicon]);
    });

    it("un tema que no existe da tema no encontrado", async () => {
      const result = await new UpdateTopicEventsUseCase(deps()).execute({ topicId: "topic-missing", events: [] });

      expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
    });

    it("rechaza campos de más (Mass Assignment): el tema de cada fila lo pone el servidor", async () => {
      const result = await new UpdateTopicEventsUseCase(deps()).execute({
        topicId: "topic-caesar",
        events: [{ ...eventRow, topicId: "topic-other" }],
      });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
    });
  });

  describe("GetTopicForEditingUseCase", () => {
    it("trae todo lo que edita el panel: el tema, sus listas (con las respuestas del quiz) y los demás temas", async () => {
      const result = await new GetTopicForEditingUseCase(deps()).execute("topic-caesar");

      expect(result.success && result.data).toEqual({
        topic: caesar,
        events: [rubicon],
        quiz: caesarQuiz,
        recommendations: [book],
        otherTopics: [
          { id: "topic-alesia", title: "Asedio de Alesia", era: "ROMAN", status: "PUBLISHED" },
          { id: "topic-viriato", title: "Viriato", era: "HISPANIA", status: "DRAFT" },
        ],
        imageOptions: [],
        selectedImageId: null,
      });
    });
  });
});
