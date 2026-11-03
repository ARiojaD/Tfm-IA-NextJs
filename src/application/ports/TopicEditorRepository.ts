import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Slug } from "@/domain/value-objects/Slug";

// The admin panel's view of the topics: unlike TopicRepository (the public one, published topics only),
// it sees drafts too, and it writes. Only the admin use cases receive it.
export interface TopicEditorRepository {
  // Any status. Unknown ids → null.
  findById(id: EntityId): Promise<HistoricalTopic | null>;
  // Every topic, drafts included. The order is not guaranteed.
  listAll(): Promise<HistoricalTopic[]>;
  // Whether any topic (draft or published) already uses this slug: slugs are unique.
  slugExists(slug: Slug): Promise<boolean>;
  // Creates the topic or replaces its own fields. Its related topics are kept as they are (they are
  // managed apart, in both directions).
  save(topic: HistoricalTopic): Promise<void>;
  delete(id: EntityId): Promise<void>;
  // Relations go both ways: relating A to B also lists A in B, and removing it removes both sides.
  // Replaces the whole list of the topic; the ids must be of existing topics (checked by the use case).
  setRelatedTopics(topicId: EntityId, relatedTopicIds: EntityId[]): Promise<void>;
}
