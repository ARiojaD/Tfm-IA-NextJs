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

// What a civilization page shows: its topics grouped by category (people, battles and wars,
// periods, cities), in the fixed category order and leaving out empty categories, each one in time order.
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
