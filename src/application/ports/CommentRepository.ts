import type { Comment } from "@/domain/entities/Comment";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Los comentarios de la zona social de cada tema. Solo se añaden: no hay edición ni borrado desde la web.
export interface CommentRepository {
  listByTopic(topicId: EntityId): Promise<Comment[]>;
  add(comment: Comment): Promise<void>;
}
