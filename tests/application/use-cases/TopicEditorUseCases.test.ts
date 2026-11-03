import { beforeEach, describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicIsPublishedError } from "@/application/errors/TopicIsPublishedError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { Clock } from "@/application/ports/Clock";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import { ChangeTopicStatusUseCase } from "@/application/use-cases/ChangeTopicStatusUseCase";
import { CreateTopicUseCase } from "@/application/use-cases/CreateTopicUseCase";
import { DeleteTopicUseCase } from "@/application/use-cases/DeleteTopicUseCase";
import { GetTopicForEditingUseCase } from "@/application/use-cases/GetTopicForEditingUseCase";
import { GetTopicPreviewUseCase } from "@/application/use-cases/GetTopicPreviewUseCase";
import { ListTopicsForAdminUseCase } from "@/application/use-cases/ListTopicsForAdminUseCase";
import { UpdateTopicBasicsUseCase } from "@/application/use-cases/UpdateTopicBasicsUseCase";
import { UpdateTopicIntroductionUseCase } from "@/application/use-cases/UpdateTopicIntroductionUseCase";
import { UpdateTopicKeyFactsUseCase } from "@/application/use-cases/UpdateTopicKeyFactsUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic, anEvent } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", period: { start: { year: -100 } } });
const ADMIN_LIMIT = 50;

// What the "new topic" form sends: every value is a string, as in a real form.
const viriato = {
  title: "Viriato",
  era: "HISPANIA",
  category: "PEOPLE",
  summary: "El pastor lusitano que puso en jaque a Roma.",
  startYear: "180",
  startEra: "BC",
  startMonth: "",
  endYear: "139",
  endEra: "BC",
  endMonth: "",
};

const frozenClock: Clock = { now: () => new Date("2026-11-03T10:00:00Z") };

describe("Editor de temas", () => {
  let topics: InMemoryTopicRepository;
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;
  let ids: IdGenerator;
  let rateLimiter: InMemoryRateLimiter;

  beforeEach(async () => {
    topics = new InMemoryTopicRepository([caesar]);
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    let next = 0;
    ids = { generate: () => `topic-new-${++next}` };
    rateLimiter = new InMemoryRateLimiter({ limit: ADMIN_LIMIT, windowMs: 60_000 }, frozenClock);
    const registered = await auth.register({ name: "Admin", email: "admin@example.com", password: "frase larga de la admin" });
    if (registered.ok) await roles.setRole(registered.user.id, "ADMIN");
  });

  const deps = () => ({ topicEditor: topics, auth, roles, rateLimiter, ids });

  async function createViriato() {
    const created = await new CreateTopicUseCase(deps()).execute(viriato);
    if (!created.success) throw new Error("No se pudo crear el tema de prueba");
    return created.data.id;
  }

  describe("CreateTopicUseCase", () => {
    it("crea el tema como borrador, con su slug y su periodo a.C. en años negativos", async () => {
      const id = await createViriato();

      expect(await topics.findById(id)).toEqual({
        id: "topic-new-1",
        slug: "viriato",
        title: "Viriato",
        era: "HISPANIA",
        category: "PEOPLE",
        summary: "El pastor lusitano que puso en jaque a Roma.",
        period: { start: { year: -180 }, end: { year: -139 } },
        introduction: [],
        keyFacts: [],
        relatedTopicIds: [],
        status: "DRAFT",
      });
    });

    it("un borrador no es visible para el público", async () => {
      await createViriato();

      expect(await topics.findBySlug("viriato")).toBeNull();
    });

    it("si el slug ya existe, añade un número para que sea único", async () => {
      await createViriato();

      const second = await new CreateTopicUseCase(deps()).execute(viriato);

      expect(second.success && (await topics.findById(second.data.id))?.slug).toBe("viriato-2");
    });

    it("acepta años d.C. y meses", async () => {
      const result = await new CreateTopicUseCase(deps()).execute({
        ...viriato,
        startYear: "27",
        startEra: "BC",
        startMonth: "1",
        endYear: "14",
        endEra: "AD",
        endMonth: "8",
      });

      expect(result.success && (await topics.findById(result.data.id))?.period).toEqual({
        start: { year: -27, month: 1 },
        end: { year: 14, month: 8 },
      });
    });

    it("sin año de fin, el periodo no tiene fin", async () => {
      const result = await new CreateTopicUseCase(deps()).execute({ ...viriato, endYear: "", endMonth: "" });

      expect(result.success && (await topics.findById(result.data.id))?.period).toEqual({ start: { year: -180 } });
    });

    it.each([
      ["un título vacío", { title: "  " }, "title"],
      ["un título de más de 120 caracteres", { title: "a".repeat(121) }, "title"],
      ["una civilización desconocida", { era: "EGYPT" }, "era"],
      ["una categoría desconocida", { category: "GODS" }, "category"],
      ["un resumen vacío", { summary: "" }, "summary"],
      ["un año que no es un número", { startYear: "doscientos" }, "startYear"],
      ["el año 0", { startYear: "0" }, "startYear"],
      ["un mes fuera de rango", { startMonth: "13" }, "startMonth"],
      ["un fin anterior al inicio", { startYear: "100", endYear: "200", endEra: "BC" }, "endYear"],
    ])("rechaza %s indicando el campo", async (_case, overrides, field) => {
      const result = await new CreateTopicUseCase(deps()).execute({ ...viriato, ...overrides });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors).toHaveProperty(field);
      expect(await topics.listAll()).toHaveLength(1);
    });

    it.each([
      ["el estado", { status: "PUBLISHED" }],
      ["el slug", { slug: "otro-slug" }],
      ["el id", { id: "id-elegido" }],
    ])("rechaza que el formulario intente fijar %s (Mass Assignment)", async (_case, extra) => {
      const result = await new CreateTopicUseCase(deps()).execute({ ...viriato, ...extra });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
    });
  });

  describe("solo administradores (OWASP A01)", () => {
    it("un usuario normal no puede crear, editar, publicar ni borrar", async () => {
      const id = await createViriato();
      await auth.register({ name: "Lector", email: "lector@example.com", password: "frase larga del lector" });

      const results = await Promise.all([
        new CreateTopicUseCase(deps()).execute(viriato),
        new UpdateTopicBasicsUseCase(deps()).execute({ ...viriato, topicId: id }),
        new UpdateTopicIntroductionUseCase(deps()).execute({ topicId: id, introduction: "Texto" }),
        new UpdateTopicKeyFactsUseCase(deps()).execute({ topicId: id, keyFacts: [] }),
        new ChangeTopicStatusUseCase(deps()).execute({ topicId: id, status: "PUBLISHED" }),
        new DeleteTopicUseCase(deps()).execute({ topicId: id }),
        new GetTopicForEditingUseCase(deps()).execute(id),
      ]);

      for (const result of results) {
        expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
      }
      expect((await topics.findById(id))?.title).toBe("Viriato");
    });

    it("limita los cambios por minuto de cada administrador (OWASP API4)", async () => {
      for (let attempt = 0; attempt < ADMIN_LIMIT; attempt++) {
        await new CreateTopicUseCase(deps()).execute({ ...viriato, title: "" });
      }

      const result = await new CreateTopicUseCase(deps()).execute(viriato);

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });
  });

  describe("UpdateTopicBasicsUseCase", () => {
    it("cambia los datos básicos y conserva el slug, para no romper los enlaces", async () => {
      const id = await createViriato();

      await new UpdateTopicBasicsUseCase(deps()).execute({ ...viriato, topicId: id, title: "Viriato, caudillo lusitano" });

      expect(await topics.findById(id)).toMatchObject({ title: "Viriato, caudillo lusitano", slug: "viriato" });
    });

    it("devuelve tema no encontrado si el id no existe", async () => {
      const result = await new UpdateTopicBasicsUseCase(deps()).execute({ ...viriato, topicId: "topic-missing" });

      expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
    });
  });

  describe("UpdateTopicIntroductionUseCase", () => {
    it("separa la introducción en párrafos por las líneas en blanco", async () => {
      const id = await createViriato();

      await new UpdateTopicIntroductionUseCase(deps()).execute({
        topicId: id,
        introduction: "  Primer párrafo.\nSigue el primero.\n\n\n Segundo párrafo. \n\n",
      });

      expect((await topics.findById(id))?.introduction).toEqual(["Primer párrafo.\nSigue el primero.", "Segundo párrafo."]);
    });

    it("un tema publicado no puede quedarse sin introducción", async () => {
      const result = await new UpdateTopicIntroductionUseCase(deps()).execute({ topicId: "topic-caesar", introduction: " " });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors.introduction).toEqual([
        "Escribe la introducción antes de publicar",
      ]);
      expect((await topics.findById("topic-caesar"))?.introduction).toEqual(caesar.introduction);
    });

    it("rechaza una introducción de más de 20 000 caracteres", async () => {
      const id = await createViriato();

      const result = await new UpdateTopicIntroductionUseCase(deps()).execute({ topicId: id, introduction: "a".repeat(20_001) });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
    });
  });

  describe("UpdateTopicKeyFactsUseCase", () => {
    it("guarda los datos clave en orden y descarta las filas vacías", async () => {
      const id = await createViriato();

      await new UpdateTopicKeyFactsUseCase(deps()).execute({
        topicId: id,
        keyFacts: [
          { label: " Origen ", value: "Lusitania" },
          { label: "", value: "  " },
          { label: "Muerte", value: "139 a.C., traicionado" },
        ],
      });

      expect((await topics.findById(id))?.keyFacts).toEqual([
        { label: "Origen", value: "Lusitania" },
        { label: "Muerte", value: "139 a.C., traicionado" },
      ]);
    });

    it("indica en qué dato está el error", async () => {
      const id = await createViriato();

      const result = await new UpdateTopicKeyFactsUseCase(deps()).execute({
        topicId: id,
        keyFacts: [
          { label: "Origen", value: "Lusitania" },
          { label: "", value: "Sin etiqueta" },
        ],
      });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors.keyFacts).toEqual([
        "Dato 2: escribe la etiqueta",
      ]);
    });

    it("rechaza más de 20 datos clave", async () => {
      const id = await createViriato();
      const keyFacts = Array.from({ length: 21 }, (_, index) => ({ label: `Dato ${index}`, value: "Valor" }));

      const result = await new UpdateTopicKeyFactsUseCase(deps()).execute({ topicId: id, keyFacts });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
    });
  });

  describe("ChangeTopicStatusUseCase", () => {
    it("no publica un borrador incompleto y explica lo que falta", async () => {
      const id = await createViriato();

      const result = await new ChangeTopicStatusUseCase(deps()).execute({ topicId: id, status: "PUBLISHED" });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.formErrors).toEqual([
        "Escribe la introducción antes de publicar",
        "Añade al menos un dato clave antes de publicar",
      ]);
      expect((await topics.findById(id))?.status).toBe("DRAFT");
    });

    it("publica un borrador completo: pasa a verse en la web", async () => {
      const id = await createViriato();
      await new UpdateTopicIntroductionUseCase(deps()).execute({ topicId: id, introduction: "Pastor lusitano." });
      await new UpdateTopicKeyFactsUseCase(deps()).execute({ topicId: id, keyFacts: [{ label: "Origen", value: "Lusitania" }] });

      const result = await new ChangeTopicStatusUseCase(deps()).execute({ topicId: id, status: "PUBLISHED" });

      expect(result.success).toBe(true);
      expect((await topics.findBySlug("viriato"))?.status).toBe("PUBLISHED");
    });

    it("despublica un tema: deja de verse en la web pero conserva sus datos", async () => {
      await new ChangeTopicStatusUseCase(deps()).execute({ topicId: "topic-caesar", status: "DRAFT" });

      expect(await topics.findBySlug("julio-cesar")).toBeNull();
      expect(await topics.findById("topic-caesar")).toEqual({ ...caesar, status: "DRAFT" });
    });
  });

  describe("DeleteTopicUseCase", () => {
    it("borra un borrador", async () => {
      const id = await createViriato();

      const result = await new DeleteTopicUseCase(deps()).execute({ topicId: id });

      expect(result.success).toBe(true);
      expect(await topics.findById(id)).toBeNull();
    });

    it("no borra un tema publicado: hay que despublicarlo antes", async () => {
      const result = await new DeleteTopicUseCase(deps()).execute({ topicId: "topic-caesar" });

      expect(!result.success && result.error).toBeInstanceOf(TopicIsPublishedError);
      expect(await topics.findById("topic-caesar")).toEqual(caesar);
    });
  });

  describe("lectura para el panel", () => {
    it("GetTopicForEditing devuelve también los borradores", async () => {
      const id = await createViriato();

      const result = await new GetTopicForEditingUseCase(deps()).execute(id);

      expect(result.success && result.data.title).toBe("Viriato");
    });

    it("ListTopicsForAdmin incluye los borradores en su civilización", async () => {
      await createViriato();

      const result = await new ListTopicsForAdminUseCase(deps()).execute();

      const hispania = result.success && result.data.find((group) => group.era === "HISPANIA");
      expect(hispania && hispania.topics.map((topic) => [topic.title, topic.status])).toEqual([["Viriato", "DRAFT"]]);
    });

    it("GetTopicPreview carga un borrador con todos sus módulos, como su página pública", async () => {
      const id = await createViriato();
      const events = new InMemoryHistoricalEventRepository([anEvent({ id: "event-viriato", topicId: id })]);
      const preview = new GetTopicPreviewUseCase({
        ...deps(),
        topics,
        events,
        quizzes: new InMemoryQuizRepository(),
        comments: new InMemoryCommentRepository(),
        recommendations: new InMemoryRecommendationRepository(),
      });

      const result = await preview.execute(id);

      expect(result.success && [result.data.topic.title, result.data.events.map((event) => event.id)]).toEqual([
        "Viriato",
        ["event-viriato"],
      ]);
    });
  });
});
