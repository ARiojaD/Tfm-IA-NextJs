import { beforeEach, describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { Clock } from "@/application/ports/Clock";
import type { IdGenerator } from "@/application/ports/IdGenerator";
import { GetEraTimelineForEditingUseCase } from "@/application/use-cases/GetEraTimelineForEditingUseCase";
import { UpdateEraMilestonesUseCase } from "@/application/use-cases/UpdateEraMilestonesUseCase";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { InMemoryTimelineMilestoneRepository } from "@/infrastructure/persistence/in-memory/InMemoryTimelineMilestoneRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic } from "../../fixtures/historicalTopics";
import { aMilestone } from "../../fixtures/timeline";

const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César", period: { start: { year: -100 } } });
const augustusDraft = aTopic({ id: "topic-augustus", slug: "augusto", title: "Augusto", status: "DRAFT", period: { start: { year: -63 } } });
const pericles = aTopic({ id: "topic-pericles", slug: "pericles", title: "Pericles", era: "ANCIENT_GREECE" });

const rubicon = aMilestone({ id: "m-rubicon", date: { year: -49, month: 1 }, title: "César cruza el Rubicón", topicId: "topic-caesar" });
const punicWar = aMilestone({ id: "m-punic", date: { year: -264 }, title: "Primera guerra púnica" });
const marathon = aMilestone({ id: "m-marathon", era: "ANCIENT_GREECE", date: { year: -490 }, title: "Batalla de Maratón" });

const frozenClock: Clock = { now: () => new Date("2026-11-13T10:00:00Z") };

// Lo que envía el formulario: las filas tal como las escribió el administrador, con años y meses como texto.
const row = (overrides: Record<string, string> = {}) => ({
  id: "",
  title: "Batalla de Accio",
  year: "31",
  era: "BC",
  month: "9",
  description: "Octavio vence a Marco Antonio y Cleopatra.",
  topicId: "",
  ...overrides,
});

describe("Editor de la cronología de una civilización", () => {
  let milestones: InMemoryTimelineMilestoneRepository;
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;
  let ids: IdGenerator;
  let rateLimit = 100;

  beforeEach(async () => {
    milestones = new InMemoryTimelineMilestoneRepository([rubicon, punicWar, marathon]);
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    rateLimit = 100;
    let next = 0;
    ids = { generate: () => `new-${++next}` };
    const registered = await auth.register({ name: "Admin", email: "admin@example.com", password: "frase larga de la admin" });
    if (registered.ok) await roles.setRole(registered.user.id, "ADMIN");
  });

  const deps = () => ({
    milestones,
    topicEditor: new InMemoryTopicRepository([caesar, augustusDraft, pericles]),
    auth,
    roles,
    ids,
    rateLimiter: new InMemoryRateLimiter({ limit: rateLimit, windowMs: 60_000 }, frozenClock),
  });
  const update = (input: unknown) => new UpdateEraMilestonesUseCase(deps()).execute(input);

  describe("GetEraTimelineForEditingUseCase", () => {
    it("trae los hitos de la civilización por fecha y sus temas para enlazar, también los borradores", async () => {
      const result = await new GetEraTimelineForEditingUseCase(deps()).execute("ROMAN");

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.milestones.map((milestone) => milestone.id)).toEqual(["m-punic", "m-rubicon"]);
      expect(result.data.topicOptions).toEqual([
        { id: "topic-caesar", title: "Julio César", status: "PUBLISHED" },
        { id: "topic-augustus", title: "Augusto", status: "DRAFT" },
      ]);
    });

    it("solo es para administradores", async () => {
      await auth.signOut();
      await auth.register({ name: "Livia", email: "livia@example.com", password: "frase larga de livia" });

      const result = await new GetEraTimelineForEditingUseCase(deps()).execute("ROMAN");

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
    });
  });

  describe("UpdateEraMilestonesUseCase", () => {
    it("guarda la cronología: conserva el id de los hitos de la civilización y da uno nuevo a los demás", async () => {
      const result = await update({
        era: "ROMAN",
        milestones: [row({ id: "m-rubicon", title: "El paso del Rubicón", year: "49", month: "1", topicId: "topic-caesar" }), row()],
      });

      expect(result.success).toBe(true);
      expect(await milestones.listByEra("ROMAN")).toEqual([
        { ...rubicon, title: "El paso del Rubicón", description: "Octavio vence a Marco Antonio y Cleopatra." },
        {
          id: "new-1",
          era: "ROMAN",
          date: { year: -31, month: 9 },
          title: "Batalla de Accio",
          description: "Octavio vence a Marco Antonio y Cleopatra.",
        },
      ]);
    });

    it("no toca la cronología de las demás civilizaciones", async () => {
      await update({ era: "ROMAN", milestones: [] });

      expect(await milestones.listByEra("ROMAN")).toEqual([]);
      expect(await milestones.listByEra("ANCIENT_GREECE")).toEqual([marathon]);
    });

    it("no deja sobrescribir un hito de otra civilización enviando su id: recibe un id nuevo", async () => {
      await update({ era: "ROMAN", milestones: [row({ id: "m-marathon" })] });

      expect((await milestones.listByEra("ROMAN"))[0].id).toBe("new-1");
      expect(await milestones.listByEra("ANCIENT_GREECE")).toEqual([marathon]);
    });

    it("puede enlazar un borrador: la página pública lo mostrará sin enlace hasta que se publique", async () => {
      const result = await update({ era: "ROMAN", milestones: [row({ topicId: "topic-augustus" })] });

      expect(result.success && result.data[0].topicId).toBe("topic-augustus");
    });

    it("rechaza enlazar un tema que no existe o que es de otra civilización, sin guardar nada", async () => {
      for (const topicId of ["topic-does-not-exist", "topic-pericles"]) {
        const result = await update({ era: "ROMAN", milestones: [row(), row({ topicId })] });

        expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
        if (!result.success && result.error instanceof InvalidTopicError) {
          expect(result.error.fieldErrors.milestones?.[0]).toMatch(/^Hito 2: /);
        }
      }
      expect(await milestones.listByEra("ROMAN")).toEqual([rubicon, punicWar]);
    });

    it("indica en qué hito está el error de un campo", async () => {
      const result = await update({ era: "ROMAN", milestones: [row(), row({ title: "", year: "0" })] });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
      if (!result.success && result.error instanceof InvalidTopicError) {
        expect(result.error.fieldErrors.milestones?.every((message) => message.startsWith("Hito 2: "))).toBe(true);
      }
    });

    it("rechaza una civilización desconocida y campos de más (Mass Assignment)", async () => {
      expect((await update({ era: "ATLANTIS", milestones: [] })).success).toBe(false);
      expect((await update({ era: "ROMAN", milestones: [{ ...row(), era: "AD", userId: "x" }] })).success).toBe(false);
    });

    it("solo es para administradores", async () => {
      await auth.signOut();

      const result = await update({ era: "ROMAN", milestones: [] });

      expect(!result.success && result.error).toBeInstanceOf(AuthenticationRequiredError);
      expect(await milestones.listByEra("ROMAN")).toHaveLength(2);
    });

    it("cuenta para el límite de cambios del panel, antes de validar (OWASP API4)", async () => {
      rateLimit = 1;
      const useCase = new UpdateEraMilestonesUseCase(deps());

      await useCase.execute({ era: "ATLANTIS" });
      const result = await useCase.execute({ era: "ROMAN", milestones: [] });

      expect(!result.success && result.error).toBeInstanceOf(RateLimitExceededError);
    });
  });
});
