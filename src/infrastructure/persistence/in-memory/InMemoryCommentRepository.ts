import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { Comment } from "@/domain/entities/Comment";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Comments added at runtime live only in this process: they are lost when the server restarts.
export class InMemoryCommentRepository implements CommentRepository {
  private readonly comments: Comment[];

  constructor(comments: Comment[] = []) {
    this.comments = structuredClone(comments);
  }

  async listByTopic(topicId: EntityId): Promise<Comment[]> {
    return structuredClone(this.comments.filter((comment) => comment.topicId === topicId));
  }

  async add(comment: Comment): Promise<void> {
    this.comments.push(structuredClone(comment));
  }
}
