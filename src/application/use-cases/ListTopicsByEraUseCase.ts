import { compareTopicsChronologically, type HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/domain/value-objects/TopicCategory";
import type { TopicRepository } from "../ports/TopicRepository";

export interface TopicCategoryGroup {
  category: TopicCategory;
  topics: HistoricalTopic[];
}

export interface EraOverview {
  era: HistoricalEra;
  totalTopics: number;
  categories: TopicCategoryGroup[];
}

// Lo que muestra la página de una civilización: sus temas agrupados por categoría (personajes, guerras y
// batallas, periodos, ciudades), en el orden fijo de las categorías y sin las vacías, cada una en orden
// cronológico.
export class ListTopicsByEraUseCase {
  constructor(private readonly dependencies: { topics: TopicRepository }) {}

  async execute(era: HistoricalEra): Promise<EraOverview> {
    const topics = await this.dependencies.topics.listByEra(era);

    const categories = TOPIC_CATEGORIES.map((category) => ({
      category,
      topics: topics.filter((topic) => topic.category === category).toSorted(compareTopicsChronologically),
    })).filter((group) => group.topics.length > 0);

    return { era, totalTopics: topics.length, categories };
  }
}
