import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { Quiz } from "@/domain/entities/Quiz";
import type { EntityId } from "@/domain/value-objects/EntityId";

export class InMemoryQuizRepository implements QuizRepository {
  private quizzes: Quiz[];

  constructor(quizzes: Quiz[] = []) {
    this.quizzes = structuredClone(quizzes);
  }

  findByTopic(topicId: EntityId): Promise<Quiz | null> {
    const quiz = this.quizzes.find((candidate) => candidate.topicId === topicId);
    return Promise.resolve(quiz ? structuredClone(quiz) : null);
  }

  replaceForTopic(topicId: EntityId, quiz: Quiz | null): Promise<void> {
    this.quizzes = [...this.quizzes.filter((candidate) => candidate.topicId !== topicId), ...(quiz ? [structuredClone(quiz)] : [])];
    return Promise.resolve();
  }
}
