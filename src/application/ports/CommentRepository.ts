import type { Comment } from "@/domain/entities/Comment";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface CommentRepository {
  listByTopic(topicId: EntityId): Promise<Comment[]>;
  add(comment: Comment): Promise<void>;
}
