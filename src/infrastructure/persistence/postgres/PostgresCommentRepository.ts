import { eq } from "drizzle-orm";
import type { CommentRepository } from "@/application/ports/CommentRepository";
import type { Comment } from "@/domain/entities/Comment";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toComment, toCommentRow } from "./mappers";
import { comments } from "./schema";

// Los comentarios en PostgreSQL. El orden lo decide el caso de uso (los más recientes primero).
export class PostgresCommentRepository implements CommentRepository {
  constructor(private readonly db: Database) {}

  async listByTopic(topicId: EntityId): Promise<Comment[]> {
    const rows = await this.db.select().from(comments).where(eq(comments.topicId, topicId));
    return rows.map(toComment);
  }

  async add(comment: Comment): Promise<void> {
    await this.db.insert(comments).values(toCommentRow(comment));
  }
}
