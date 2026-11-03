import type { TopicEditorRepository } from "@/application/ports/TopicEditorRepository";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import type { Slug } from "@/domain/value-objects/Slug";

// One store behind both ports: the public side (published topics only) and the admin editor (everything).
// structuredClone on the way in and out mimics a database: callers never share references with the store.
export class InMemoryTopicRepository implements TopicRepository, TopicEditorRepository {
  private readonly topics: HistoricalTopic[];

  constructor(topics: HistoricalTopic[] = []) {
    this.topics = structuredClone(topics);
  }

  findBySlug(slug: Slug): Promise<HistoricalTopic | null> {
    const topic = this.published().find((candidate) => candidate.slug === slug);
    return Promise.resolve(topic ? structuredClone(topic) : null);
  }

  listByEra(era: HistoricalEra): Promise<HistoricalTopic[]> {
    return Promise.resolve(structuredClone(this.published().filter((topic) => topic.era === era)));
  }

  findByIds(ids: EntityId[]): Promise<HistoricalTopic[]> {
    return Promise.resolve(structuredClone(this.published().filter((topic) => ids.includes(topic.id))));
  }

  findById(id: EntityId): Promise<HistoricalTopic | null> {
    const topic = this.topics.find((candidate) => candidate.id === id);
    return Promise.resolve(topic ? structuredClone(topic) : null);
  }

  listAll(): Promise<HistoricalTopic[]> {
    return Promise.resolve(structuredClone(this.topics));
  }

  slugExists(slug: Slug): Promise<boolean> {
    return Promise.resolve(this.topics.some((topic) => topic.slug === slug));
  }

  save(topic: HistoricalTopic): Promise<void> {
    const index = this.topics.findIndex((candidate) => candidate.id === topic.id);
    if (index === -1) {
      this.topics.push(structuredClone(topic));
    } else {
      // Related topics are not the topic's own fields: they stay as they were.
      this.topics[index] = { ...structuredClone(topic), relatedTopicIds: this.topics[index].relatedTopicIds };
    }
    return Promise.resolve();
  }

  delete(id: EntityId): Promise<void> {
    const index = this.topics.findIndex((topic) => topic.id === id);
    if (index !== -1) this.topics.splice(index, 1);
    return Promise.resolve();
  }

  private published(): HistoricalTopic[] {
    return this.topics.filter((topic) => topic.status === "PUBLISHED");
  }
}
