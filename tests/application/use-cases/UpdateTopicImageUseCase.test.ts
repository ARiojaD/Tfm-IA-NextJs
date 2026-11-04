import { beforeEach, describe, expect, it } from "vitest";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import type { Clock } from "@/application/ports/Clock";
import { GetTopicForEditingUseCase } from "@/application/use-cases/GetTopicForEditingUseCase";
import { UpdateTopicImageUseCase } from "@/application/use-cases/UpdateTopicImageUseCase";
import { type CatalogImage, CatalogImageSchema } from "@/domain/entities/CatalogImage";
import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { StaticImageCatalog } from "@/infrastructure/images/StaticImageCatalog";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { InMemoryRateLimiter } from "@/infrastructure/rate-limiting/InMemoryRateLimiter";
import { aTopic } from "../../fixtures/historicalTopics";

const catalogImage = (overrides: Partial<CatalogImage>): CatalogImage =>
  CatalogImageSchema.parse({
    id: "roma-foro",
    src: "/images/catalog/roma-foro.jpg",
    width: 1200,
    height: 800,
    credit: "Dominio público",
    era: "ROMAN",
    kind: "GENERAL",
    alt: "Ruinas del Foro romano",
    caption: "El Foro romano.",
    ...overrides,
  });

const forum = catalogImage({});
const bust = catalogImage({ id: "cesar-busto", src: "/images/topics/cesar.jpg", kind: "SPECIFIC", width: 900, height: 1600 });
const parthenon = catalogImage({ id: "grecia-partenon", src: "/images/catalog/grecia-partenon.jpg", era: "ANCIENT_GREECE" });

const pompey = aTopic({ id: "topic-pompey", slug: "pompeyo", title: "Pompeyo", status: "DRAFT" });
const frozenClock: Clock = { now: () => new Date("2026-11-04T10:00:00Z") };

describe("Imagen de un tema (catálogo controlado)", () => {
  let topics: InMemoryTopicRepository;
  let auth: InMemoryAuthService;
  let roles: InMemoryUserRoleRepository;

  beforeEach(async () => {
    topics = new InMemoryTopicRepository([pompey]);
    auth = new InMemoryAuthService();
    roles = new InMemoryUserRoleRepository();
    const registered = await auth.register({ name: "Admin", email: "admin@example.com", password: "frase larga de la admin" });
    if (registered.ok) await roles.setRole(registered.user.id, "ADMIN");
  });

  const deps = () => ({
    topicEditor: topics,
    images: new StaticImageCatalog([forum, bust, parthenon]),
    events: new InMemoryHistoricalEventRepository(),
    quizzes: new InMemoryQuizRepository(),
    recommendations: new InMemoryRecommendationRepository(),
    auth,
    roles,
    rateLimiter: new InMemoryRateLimiter({ limit: 100, windowMs: 60_000 }, frozenClock),
  });

  describe("UpdateTopicImageUseCase", () => {
    it("pone una imagen del catálogo: archivo, tamaño y crédito del catálogo; texto alternativo y pie del admin", async () => {
      const result = await new UpdateTopicImageUseCase(deps()).execute({
        topicId: "topic-pompey",
        imageId: "roma-foro",
        alt: "El Foro romano en ruinas",
        caption: "El Foro, escenario de la política romana.",
      });

      expect(result.success).toBe(true);
      expect((await topics.findById("topic-pompey"))?.image).toEqual({
        src: "/images/catalog/roma-foro.jpg",
        width: 1200,
        height: 800,
        credit: "Dominio público",
        alt: "El Foro romano en ruinas",
        caption: "El Foro, escenario de la política romana.",
      });
    });

    it("sin imagen elegida, el tema se queda sin imagen", async () => {
      await new UpdateTopicImageUseCase(deps()).execute({ topicId: "topic-pompey", imageId: "roma-foro", alt: "Foro", caption: "Foro." });

      await new UpdateTopicImageUseCase(deps()).execute({ topicId: "topic-pompey", imageId: "", alt: "", caption: "" });

      expect((await topics.findById("topic-pompey"))?.image).toBeUndefined();
    });

    it.each([
      ["una imagen que no está en el catálogo", { imageId: "subida-por-mi" }, "imageId", "Elige una imagen del catálogo"],
      ["una ruta en lugar de un id", { imageId: "../../secretos" }, "imageId", "Elige una imagen del catálogo"],
      ["una imagen sin texto alternativo", { alt: " " }, "alt", "Describe la imagen para quien no puede verla"],
      ["una imagen sin pie", { caption: "" }, "caption", "Escribe un pie de foto"],
    ])("rechaza %s, sin cambiar nada", async (_case, overrides, field, message) => {
      const result = await new UpdateTopicImageUseCase(deps()).execute({
        topicId: "topic-pompey",
        imageId: "roma-foro",
        alt: "Foro",
        caption: "Foro.",
        ...overrides,
      });

      expect(!result.success && result.error instanceof InvalidTopicError && result.error.fieldErrors[field]).toEqual([message]);
      expect((await topics.findById("topic-pompey"))?.image).toBeUndefined();
    });

    it("rechaza que el formulario fije el archivo o el crédito (Mass Assignment)", async () => {
      const result = await new UpdateTopicImageUseCase(deps()).execute({
        topicId: "topic-pompey",
        imageId: "roma-foro",
        alt: "Foro",
        caption: "Foro.",
        src: "https://example.com/otra.jpg",
      });

      expect(!result.success && result.error).toBeInstanceOf(InvalidTopicError);
    });

    it("un usuario normal no puede cambiar la imagen", async () => {
      await auth.register({ name: "Lector", email: "lector@example.com", password: "frase larga del lector" });

      const result = await new UpdateTopicImageUseCase(deps()).execute({ topicId: "topic-pompey", imageId: "roma-foro", alt: "Foro", caption: "Foro." });

      expect(!result.success && result.error).toBeInstanceOf(AdminRequiredError);
    });
  });

  describe("GetTopicForEditingUseCase", () => {
    it("ofrece las imágenes de la civilización del tema y marca la que tiene puesta", async () => {
      await new UpdateTopicImageUseCase(deps()).execute({ topicId: "topic-pompey", imageId: "cesar-busto", alt: "Busto", caption: "Busto." });

      const result = await new GetTopicForEditingUseCase(deps()).execute("topic-pompey");

      expect(result.success && result.data.imageOptions.map((image) => image.id)).toEqual(["roma-foro", "cesar-busto"]);
      expect(result.success && result.data.selectedImageId).toBe("cesar-busto");
    });

    it("sin imagen, no hay ninguna marcada", async () => {
      const result = await new GetTopicForEditingUseCase(deps()).execute("topic-pompey");

      expect(result.success && result.data.selectedImageId).toBeNull();
    });
  });
});
