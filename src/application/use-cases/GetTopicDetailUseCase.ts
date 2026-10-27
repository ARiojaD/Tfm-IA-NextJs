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

// Loads everything a topic page shows: the topic, its four modules and its related topics, already in display order.
export class GetTopicDetailUseCase {
  constructor(private readonly repositories: GetTopicDetailDependencies) {}

  async execute(slug: string): Promise<Result<TopicDetail, TopicNotFoundError>> {
    // The slug comes from the URL: anything that is not a valid slug cannot match a topic.
    const parsedSlug = SlugSchema.safeParse(slug);
    if (!parsedSlug.success) {
      return failure(new TopicNotFoundError(slug));
    }

    const topic = await this.repositories.topics.findBySlug(parsedSlug.data);
    if (!topic) {
      return failure(new TopicNotFoundError(slug));
    }

    const [events, quiz, comments, recommendations, relatedTopics] = await Promise.all([
      this.repositories.events.listByTopic(topic.id),
      this.repositories.quizzes.findByTopic(topic.id),
      this.repositories.comments.listByTopic(topic.id),
      this.repositories.recommendations.listByTopic(topic.id),
      this.repositories.topics.findByIds(topic.relatedTopicIds),
    ]);

    return success({
      topic,
      events: events.toSorted(chronologically),
      quiz: quiz ? toPublicQuiz(quiz) : null,
      comments: comments.toSorted(newestFirst),
      recommendations: recommendations.toSorted(byTypeThenYear),
      relatedTopics: relatedTopics.toSorted(byPeriod),
    });
  }
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

// Books, then films, then series (the order of RECOMMENDATION_TYPES); oldest first within each type.
function byTypeThenYear(a: Recommendation, b: Recommendation): number {
  return RECOMMENDATION_TYPES.indexOf(a.type) - RECOMMENDATION_TYPES.indexOf(b.type) || a.year - b.year;
}
