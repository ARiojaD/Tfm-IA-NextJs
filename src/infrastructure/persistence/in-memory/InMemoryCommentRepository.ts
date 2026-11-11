import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { Comment } from "@/domain/entities/Comment";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Los comentarios que se añaden en ejecución viven solo en este proceso: se pierden al reiniciar el
// servidor.
export class InMemoryCommentRepository implements CommentRepository {
  private readonly comments: Comment[];

  constructor(comments: Comment[] = []) {
    this.comments = structuredClone(comments);
  }

  listByTopic(topicId: EntityId): Promise<Comment[]> {
    return Promise.resolve(structuredClone(this.comments.filter((comment) => comment.topicId === topicId)));
  }

  add(comment: Comment): Promise<void> {
    this.comments.push(structuredClone(comment));
    return Promise.resolve();
  }
}
