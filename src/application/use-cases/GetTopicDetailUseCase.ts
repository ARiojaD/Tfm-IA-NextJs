import type { Comment } from "@/domain/entities/Comment";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { Recommendation } from "@/domain/entities/Recommendation";
import { compareHistoricalDates } from "@/domain/value-objects/HistoricalDate";
import { compareHistoricalPeriods } from "@/domain/value-objects/HistoricalPeriod";
import { RECOMMENDATION_TYPES } from "@/domain/value-objects/RecommendationType";
import { SlugSchema } from "@/domain/value-objects/Slug";
import { failure, success, type Result } from "@/shared/Result";
import { toPublicQuiz, type PublicQuiz } from "../dto/PublicQuiz";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { CommentRepository } from "../ports/CommentRepository";
import type { HistoricalEventRepository } from "../ports/HistoricalEventRepository";
import type { QuizRepository } from "../ports/QuizRepository";
import type { RecommendationRepository } from "../ports/RecommendationRepository";
import type { TopicRepository } from "../ports/TopicRepository";

export interface TopicDetail {
  topic: HistoricalTopic;
  events: HistoricalEvent[];
  quiz: PublicQuiz | null;
  comments: Comment[];
  recommendations: Recommendation[];
  relatedTopics: HistoricalTopic[];
}

export interface GetTopicDetailDependencies {
  topics: TopicRepository;
  events: HistoricalEventRepository;
  quizzes: QuizRepository;
  comments: CommentRepository;
  recommendations: RecommendationRepository;
}

// Carga todo lo que muestra la página de un tema: el tema, sus cuatro módulos y sus temas relacionados, ya
// en el orden en que se muestran.
export class GetTopicDetailUseCase {
  constructor(private readonly repositories: GetTopicDetailDependencies) {}

  async execute(slug: string): Promise<Result<TopicDetail, TopicNotFoundError>> {
    // El slug viene de la URL: algo que no es un slug válido no puede coincidir con ningún tema.
    const parsedSlug = SlugSchema.safeParse(slug);
    if (!parsedSlug.success) {
      return failure(new TopicNotFoundError(slug));
    }

    const topic = await this.repositories.topics.findBySlug(parsedSlug.data);
    if (!topic) {
      return failure(new TopicNotFoundError(slug));
    }
    return success(await loadTopicDetail(topic, this.repositories));
  }
}

// Se comparte con la vista previa del panel, así un borrador se ve exactamente como se verá su página
// pública. Los temas relacionados salen de la cara pública: solo se muestran los publicados.
export async function loadTopicDetail(
  topic: HistoricalTopic,
  repositories: GetTopicDetailDependencies,
): Promise<TopicDetail> {
  const [events, quiz, comments, recommendations, relatedTopics] = await Promise.all([
    repositories.events.listByTopic(topic.id),
    repositories.quizzes.findByTopic(topic.id),
    repositories.comments.listByTopic(topic.id),
    repositories.recommendations.listByTopic(topic.id),
    repositories.topics.findByIds(topic.relatedTopicIds),
  ]);

  return {
    topic,
    events: events.toSorted(chronologically),
    quiz: quiz ? toPublicQuiz(quiz) : null,
    comments: comments.toSorted(newestFirst),
    recommendations: recommendations.toSorted(byTypeThenYear),
    relatedTopics: relatedTopics.toSorted(byPeriod),
  };
}

function chronologically(a: HistoricalEvent, b: HistoricalEvent): number {
  return compareHistoricalDates(a.date, b.date);
}

function byPeriod(a: HistoricalTopic, b: HistoricalTopic): number {
  return compareHistoricalPeriods(a.period, b.period);
}

function newestFirst(a: Comment, b: Comment): number {
  return b.createdAt.getTime() - a.createdAt.getTime();
}

// Libros, luego películas y luego series (el orden de `RECOMMENDATION_TYPES`); dentro de cada tipo, de la
// más antigua a la más reciente.
function byTypeThenYear(a: Recommendation, b: Recommendation): number {
  return RECOMMENDATION_TYPES.indexOf(a.type) - RECOMMENDATION_TYPES.indexOf(b.type) || a.year - b.year;
}
