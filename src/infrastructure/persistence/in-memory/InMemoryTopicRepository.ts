import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";

// structuredClone on the way in and out mimics a database: callers never share references with the store.
export class InMemoryTopicRepository implements TopicRepository {
  private readonly topics: HistoricalTopic[];

  constructor(topics: HistoricalTopic[] = []) {
    this.topics = structuredClone(topics);
  }

  findBySlug(slug: Slug): Promise<HistoricalTopic | null> {
    const topic = this.topics.find((candidate) => candidate.slug === slug);
    return Promise.resolve(topic ? structuredClone(topic) : null);
  }

  listByEra(era: HistoricalEra): Promise<HistoricalTopic[]> {
    return Promise.resolve(structuredClone(this.topics.filter((topic) => topic.era === era)));
  }
}
