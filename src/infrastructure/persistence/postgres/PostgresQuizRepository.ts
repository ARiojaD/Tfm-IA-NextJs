import { asc, eq } from "drizzle-orm";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toQuiz } from "./mappers";
import { quizQuestions, quizzes } from "./schema";

export class PostgresQuizRepository implements QuizRepository {
  constructor(private readonly db: Database) {}

  async findByTopic(topicId: EntityId): Promise<Quiz | null> {
    const [quiz] = await this.db.select().from(quizzes).where(eq(quizzes.topicId, topicId)).limit(1);
    if (!quiz) return null;

    const questions = await this.db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id))
      .orderBy(asc(quizQuestions.position));
    return toQuiz(quiz, questions);
  }
}
