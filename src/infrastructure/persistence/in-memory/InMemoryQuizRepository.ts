import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";

export class InMemoryQuizRepository implements QuizRepository {
  private readonly quizzes: Quiz[];

  constructor(quizzes: Quiz[] = []) {
    this.quizzes = structuredClone(quizzes);
  }

  findByTopic(topicId: EntityId): Promise<Quiz | null> {
    const quiz = this.quizzes.find((candidate) => candidate.topicId === topicId);
    return Promise.resolve(quiz ? structuredClone(quiz) : null);
  }
}
