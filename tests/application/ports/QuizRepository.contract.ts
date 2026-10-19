import { describe, expect, it } from "vitest";
import type { QuizRepository } from "@/application/ports/QuizRepository";
import type { Quiz } from "@/domain/entities/Quiz";
import { aQuiz } from "../../fixtures/historicalTopics";

export function describeQuizRepositoryContract(
  name: string,
  createRepository: (quizzes: Quiz[]) => QuizRepository | Promise<QuizRepository>,
) {
  describe(`${name} cumple el contrato de QuizRepository`, () => {
    const caesarQuiz = aQuiz({ id: "quiz-caesar", topicId: "topic-caesar" });
    const periclesQuiz = aQuiz({ id: "quiz-pericles", topicId: "topic-pericles" });

    it("encuentra el quiz de un tema", async () => {
      const repository = await createRepository([caesarQuiz, periclesQuiz]);

      expect(await repository.findByTopic("topic-caesar")).toEqual(caesarQuiz);
    });

    it("devuelve null si el tema no tiene quiz", async () => {
      const repository = await createRepository([periclesQuiz]);

      expect(await repository.findByTopic("topic-caesar")).toBeNull();
    });

    it("devuelve copias: modificar el resultado no altera los datos guardados", async () => {
      const repository = await createRepository([caesarQuiz]);

      const quiz = await repository.findByTopic("topic-caesar");
      quiz!.questions[0].question = "Modificada";

      expect((await repository.findByTopic("topic-caesar"))?.questions[0].question).toBe(
        caesarQuiz.questions[0].question,
      );
    });
  });
}
