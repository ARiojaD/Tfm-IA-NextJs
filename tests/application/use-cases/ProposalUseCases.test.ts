import { beforeEach, describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidProposalError } from "@/application/errors/InvalidProposalError";
import { ProposalAlreadyReviewedError } from "@/application/errors/ProposalAlreadyReviewedError";
import { ProposalNotFoundError } from "@/application/errors/ProposalNotFoundError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AuthenticatedUser } from "@/application/ports/AuthService";
import type { Clock } from "@/application/ports/Clock";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import { ListMyProposalsUseCase } from "@/application/use-cases/ListMyProposalsUseCase";
import { ListPendingProposalsUseCase } from "@/application/use-cases/ListPendingProposalsUseCase";
import { ReviewProposalUseCase } from "@/application/use-cases/ReviewProposalUseCase";
import { SubmitProposalUseCase } from "@/application/use-cases/SubmitProposalUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryProposalRepository } from "@/infrastructure/persistence/in-memory/InMemoryProposalRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic, anEvent } from "../../fixtures/historicalTopics";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César" });
const draft = aTopic({ id: "topic-draft", slug: "borrador", title: "Borrador", status: "DRAFT" });
const rubicon = anEvent({ id: "event-rubicon", topicId: "topic-caesar" });

const livia = { name: "Livia", email: "livia@example.com", password: "la batalla de alesia" };
const admin = { name: "Admin", email: "admin@example.com", password: "frase larga de la admin" };
const NOW = new Date("2026-11-04T10:00:00Z");
const clock: Clock = { now: () => NOW };
const PROPOSAL_LIMIT = 3;

// What the forms send: every value a string, as in a real form.
const eventForm = {
  kind: "EVENT",
  topicSlug: "julio-cesar",
  title: "Batalla de Munda",
  year: "45",
  era: "BC",
  month: "3",
  description: "Última victoria de César en Hispania.",
  source: "Plutarco, Vidas paralelas",
};
const recommendationForm = {
  kind: "RECOMMENDATION",
  topicSlug: "julio-cesar",
  type: "BOOK",
  title: "César",
  creator: "Adrian Goldsworthy",
  year: "2006",
  description: "Biografía muy completa.",
  source: "Lo he leído",
};
const correctionForm = { kind: "CORRECTION", topicSlug: "julio-cesar", message: "Farsalia fue en agosto.", source: "Plutarco" };
const newTopicForm = {
  kind: "NEW_TOPIC",
  title: "Pompeyo",
  era: "ROMAN",
  category: "PEOPLE",
  summary: "Aliado y después rival de César.",
  startYear: "106",
  startEra: "BC",
  startMonth: "",
  endYear: "48",
  endEra: "BC",
  endMonth: "",
  description: "Gneo Pompeyo Magno.\n\nGran general de la República.",
  source: "Mary Beard, SPQR",
};

describe("Propuestas de los usuarios", () => {
  let topics: InMemoryTopicRepository;
  let events: InMemoryHistoricalEventRepository;
  let recommendations: InMemoryRecommendationRepository;
  let proposals: InMemoryProposalRepository;
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;
  let ids: IdGenerator;
  let user: AuthenticatedUser;
  let adminUser: AuthenticatedUser;

  beforeEach(async () => {
    topics = new InMemoryTopicRepository([caesar, draft]);
    events = new InMemoryHistoricalEventRepository([rubicon]);
    recommendations = new InMemoryRecommendationRepository();
    proposals = new InMemoryProposalRepository();
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    let next = 0;
    ids = { generate: () => `new-${++next}` };
    const registeredAdmin = await auth.register(admin);
    adminUser = registeredAdmin.ok ? registeredAdmin.user : { id: "", name: "" };
    await roles.setRole(adminUser.id, "ADMIN");
    const registered = await auth.register(livia); // Livia stays signed in
    user = registered.ok ? registered.user : { id: "", name: "" };
  });

  const submit = () =>
    new SubmitProposalUseCase({
      auth,
      topics,
      proposals,
      ids,
      clock,
      rateLimiter: new InMemoryRateLimiter({ limit: PROPOSAL_LIMIT, windowMs: 3_600_000 }, clock),
    });
  const review = () =>
    new ReviewProposalUseCase({
      auth,
      roles,
      proposals,
      topicEditor: topics,
      events,
      recommendations,
      ids,
      clock,
      rateLimiter: new InMemoryRateLimiter({ limit: 100, windowMs: 60_000 }, clock),
    });
  const signInAsAdmin = () => auth.signIn({ email: admin.email, password: admin.password });

  describe("SubmitProposalUseCase", () => {
    it("guarda la propuesta pendiente, con el autor de la sesión y el tema", async () => {
      const result = await submit().execute(eventForm);

      expect(result.success && result.data).toEqual({
        id: "new-1",
        userId: user.id,
        authorName: "Livia",
        kind: "EVENT",
        topicId: "topic-caesar",
        topicTitle: "Julio César",
        event: { title: "Batalla de Munda", date: { year: -45, month: 3 }, description: "Última victoria de César en Hispania." },
        source: "Plutarco, Vidas paralelas",
        status: "PENDING",
        createdAt: NOW,
      });
    });

    it.each([
      ["una recomendación", recommendationForm],
      ["una corrección", correctionForm],
      ["un tema nuevo", newTopicForm],
    ])("acepta %s", async (_case, form) => {
      const result = await submit().execute(form);

      expect(result.success && result.data.status).toBe("PENDING");
    });

    it("sin sesión no se puede proponer", async () => {
      await auth.signOut();

      const result = await submit().execute(correctionForm);

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
    });

    it.each([
      ["sin fuente", { ...correctionForm, source: " " }, "source"],
      ["un tipo desconocido", { ...correctionForm, kind: "IMAGE" }, "kind"],
      ["un año 0", { ...eventForm, year: "0" }, "year"],
      ["un fin anterior al inicio", { ...newTopicForm, startYear: "48", endYear: "106" }, "endYear"],
    ])("rechaza una propuesta %s indicando el campo", async (_case, form, field) => {
      const result = await submit().execute(form);

      expect(!result.success && result.error instanceof InvalidProposalError && result.error.fieldErrors).toHaveProperty(field);
    });

    it.each([
      ["el autor", { authorName: "Otra persona" }],
      ["el usuario", { userId: "otra-persona" }],
      ["el estado", { status: "APPROVED" }],
    ])("rechaza que el formulario fije %s (Mass Assignment)", async (_case, extra) => {
      const result = await submit().execute({ ...correctionForm, ...extra });

      expect(!result.success && result.error).toBeInstanceOf(InvalidProposalError);
    });

    it("solo se proponen cambios a temas publicados", async () => {
      const result = await submit().execute({ ...correctionForm, topicSlug: "borrador" });

      expect(!result.success && result.error).toBeInstanceOf(TopicNotFoundError);
    });

    it("limita las propuestas por usuario (OWASP API4)", async () => {
      const useCase = submit(); // one limiter for every attempt
      for (let attempt = 0; attempt < PROPOSAL_LIMIT; attempt++) await useCase.execute(correctionForm);

      const blocked = await useCase.execute(correctionForm);

      expect(!blocked.success && blocked.error).toBeInstanceOf(RateLimitExceededError);
      expect((await proposals.listByUser(user.id)).length).toBe(PROPOSAL_LIMIT);
    });
  });

  describe("ListMyProposalsUseCase", () => {
    it("cada usuario ve solo sus propuestas (OWASP BOLA)", async () => {
      await submit().execute(correctionForm);
      await signInAsAdmin();
      await submit().execute(eventForm);

      const adminList = await new ListMyProposalsUseCase({ auth, proposals }).execute();

      expect(adminList.success && adminList.data.map((proposal) => proposal.kind)).toEqual(["EVENT"]);
    });

    it("sin sesión pide iniciarla", async () => {
      await auth.signOut();

      const result = await new ListMyProposalsUseCase({ auth, proposals }).execute();

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
    });
  });

  describe("ListPendingProposalsUseCase", () => {
    it("un usuario normal no ve la bandeja", async () => {
      const result = await new ListPendingProposalsUseCase({ auth, roles, proposals }).execute();

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
    });

    it("una administradora ve las pendientes de todos", async () => {
      await submit().execute(correctionForm);
      await signInAsAdmin();

      const result = await new ListPendingProposalsUseCase({ auth, roles, proposals }).execute();

      expect(result.success && result.data.map((proposal) => proposal.authorName)).toEqual(["Livia"]);
    });
  });

  describe("ReviewProposalUseCase", () => {
    async function proposeAndSignInAsAdmin(form: object) {
      const submitted = await submit().execute(form);
      if (!submitted.success) throw new Error("No se pudo enviar la propuesta de prueba");
      await signInAsAdmin();
      return submitted.data.id;
    }

    it("aprobar un evento lo añade a la cronología del tema, con la civilización del tema", async () => {
      const id = await proposeAndSignInAsAdmin(eventForm);

      const result = await review().execute({ proposalId: id, decision: "approve", note: "" });

      expect(result.success).toBe(true);
      expect(await events.listByTopic("topic-caesar")).toEqual([
        rubicon,
        {
          id: "new-2",
          topicId: "topic-caesar",
          title: "Batalla de Munda",
          date: { year: -45, month: 3 },
          era: "ROMAN",
          description: "Última victoria de César en Hispania.",
        },
      ]);
      expect(await proposals.findById(id)).toMatchObject({ status: "APPROVED", reviewedAt: NOW, reviewedBy: adminUser.id });
    });

    it("aprobar una recomendación la añade al tema", async () => {
      const id = await proposeAndSignInAsAdmin(recommendationForm);

      await review().execute({ proposalId: id, decision: "approve", note: "" });

      expect((await recommendations.listByTopic("topic-caesar")).map((item) => item.title)).toEqual(["César"]);
    });

    it("aprobar una corrección solo la marca como resuelta (el admin edita el tema)", async () => {
      const id = await proposeAndSignInAsAdmin(correctionForm);

      await review().execute({ proposalId: id, decision: "approve", note: "Corregido, gracias." });

      expect(await proposals.findById(id)).toMatchObject({ status: "APPROVED", reviewNote: "Corregido, gracias." });
      expect(await topics.findById("topic-caesar")).toEqual(caesar);
    });

    it("aprobar un tema nuevo crea un borrador con su descripción como introducción", async () => {
      const id = await proposeAndSignInAsAdmin(newTopicForm);

      const result = await review().execute({ proposalId: id, decision: "approve", note: "" });

      const createdId = result.success ? result.data.createdTopicId : undefined;
      expect(createdId).toBe("new-2");
      expect(await topics.findById("new-2")).toMatchObject({
        slug: "pompeyo",
        title: "Pompeyo",
        status: "DRAFT",
        period: { start: { year: -106 }, end: { year: -48 } },
        introduction: ["Gneo Pompeyo Magno.", "Gran general de la República."],
      });
      expect(await topics.findBySlug("pompeyo")).toBeNull(); // a draft: not public yet
    });

    it("rechazar exige el motivo y no cambia nada del tema", async () => {
      const id = await proposeAndSignInAsAdmin(eventForm);

      const withoutNote = await review().execute({ proposalId: id, decision: "reject", note: " " });
      const rejected = await review().execute({ proposalId: id, decision: "reject", note: "Sin fuente fiable." });

      expect(!withoutNote.success && withoutNote.error instanceof InvalidProposalError && withoutNote.error.fieldErrors.note).toEqual([
        "Explica el motivo del rechazo",
      ]);
      expect(rejected.success).toBe(true);
      expect(await proposals.findById(id)).toMatchObject({ status: "REJECTED", reviewNote: "Sin fuente fiable." });
      expect(await events.listByTopic("topic-caesar")).toEqual([rubicon]);
    });

    it("una propuesta ya revisada no se revisa otra vez (no se añade dos veces)", async () => {
      const id = await proposeAndSignInAsAdmin(eventForm);
      await review().execute({ proposalId: id, decision: "approve", note: "" });

      const again = await review().execute({ proposalId: id, decision: "approve", note: "" });

      expect(!again.success && again.error).toBeInstanceOf(ProposalAlreadyReviewedError);
      expect(await events.listByTopic("topic-caesar")).toHaveLength(2);
    });

    it("una propuesta que no existe da no encontrada", async () => {
      await signInAsAdmin();

      const result = await review().execute({ proposalId: "p-missing", decision: "approve", note: "" });

      expect(!result.success && result.error).toBeInstanceOf(ProposalNotFoundError);
    });

    it("un usuario normal no puede revisar, ni las suyas", async () => {
      const submitted = await submit().execute(eventForm);

      const result = await review().execute({ proposalId: submitted.success ? submitted.data.id : "", decision: "approve", note: "" });

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
      expect(await events.listByTopic("topic-caesar")).toEqual([rubicon]);
    });
  });
});
