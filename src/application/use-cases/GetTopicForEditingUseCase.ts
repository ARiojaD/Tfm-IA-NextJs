import type { CatalogImage } from "@/domain/entities/CatalogImage";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Quiz } from "@/domain/entities/Quiz";
import type { Recommendation } from "@/domain/entities/Recommendation";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { compareHistoricalDates } from "@/domain/value-objects/HistoricalDate";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { failure, success, type Result } from "@/shared/Result";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { HistoricalEventRepository } from "../ports/HistoricalEventRepository";
import type { ImageCatalog } from "../ports/ImageCatalog";
import type { QuizRepository } from "../ports/QuizRepository";
import type { RecommendationRepository } from "../ports/RecommendationRepository";
import type { TopicEditorRepository } from "../ports/TopicEditorRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// Los temas que ofrece el selector de temas relacionados: lo justo para elegir uno.
export type TopicOption = Pick<HistoricalTopic, "id" | "title" | "era" | "status">;

// Todo lo que muestra el editor de un tema. El quiz llega entero, con sus respuestas correctas: aquí solo
// llega un administrador (la cara pública recibe `PublicQuiz`, sin ellas).
export interface TopicEditorData {
  topic: HistoricalTopic;
  events: HistoricalEvent[];
  quiz: Quiz | null;
  recommendations: Recommendation[];
  otherTopics: TopicOption[];
  // Las imágenes del catálogo de la civilización del tema y cuál usa ahora (null: ninguna).
  imageOptions: CatalogImage[];
  selectedImageId: string | null;
}

export interface GetTopicForEditingDependencies extends AdminAuthorizationDependencies {
  topicEditor: TopicEditorRepository;
  events: HistoricalEventRepository;
  quizzes: QuizRepository;
  recommendations: RecommendationRepository;
  images: ImageCatalog;
}

// El tema tal como lo muestra el editor, también si es un borrador. El id viene de la URL.
export class GetTopicForEditingUseCase {
  constructor(private readonly dependencies: GetTopicForEditingDependencies) {}

  async execute(topicId: string): Promise<Result<TopicEditorData, AdminAuthorizationError | TopicNotFoundError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;

    const { topicEditor, events, quizzes, recommendations, images } = this.dependencies;
    const id = EntityIdSchema.safeParse(topicId);
    const topic = id.success ? await topicEditor.findById(id.data) : null;
    if (!topic) {
      return failure(new TopicNotFoundError(topicId));
    }

    const [topicEvents, quiz, topicRecommendations, allTopics, catalog] = await Promise.all([
      events.listByTopic(topic.id),
      quizzes.findByTopic(topic.id),
      recommendations.listByTopic(topic.id),
      topicEditor.listAll(),
      images.list(),
    ]);
    // La imagen en uso se busca por su archivo; se sigue ofreciendo aunque el tema haya cambiado de
    // civilización.
    const selectedImageId = catalog.find((image) => image.src === topic.image?.src)?.id ?? null;

    return success({
      topic,
      events: topicEvents.toSorted((a, b) => compareHistoricalDates(a.date, b.date)),
      quiz,
      recommendations: topicRecommendations,
      // Por civilización (en el orden de la portada) y, dentro de cada una, en orden cronológico.
      otherTopics: allTopics
        .filter((other) => other.id !== topic.id)
        .toSorted((a, b) => HISTORICAL_ERAS.indexOf(a.era) - HISTORICAL_ERAS.indexOf(b.era) || compareTopicsChronologically(a, b))
        .map(({ id: otherId, title, era, status }) => ({ id: otherId, title, era, status })),
      imageOptions: catalog.filter((image) => image.era === topic.era || image.id === selectedImageId),
      selectedImageId,
    });
  }
}
