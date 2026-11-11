import { asc, eq } from "drizzle-orm";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toQuiz, toQuizRows } from "./mappers";
import { quizQuestions, quizzes } from "./schema";

// Los quizzes en PostgreSQL: el quiz en una tabla y sus preguntas en otra, con su posición para conservar
// el orden.
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

  // En una transacción. Borrar el quiz borra sus preguntas (en cascada); vuelven en orden.
  async replaceForTopic(topicId: EntityId, quiz: Quiz | null): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(quizzes).where(eq(quizzes.topicId, topicId));
      if (quiz) {
        const rows = toQuizRows(quiz);
        await tx.insert(quizzes).values(rows.quiz);
        await tx.insert(quizQuestions).values(rows.questions);
      }
    });
  }
}
