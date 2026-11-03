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
    // Its own question id: question ids are unique across quizzes (a primary key in PostgreSQL).
    const periclesQuiz = aQuiz({
      id: "quiz-pericles",
      topicId: "topic-pericles",
      questions: [{ ...aQuiz().questions[0], id: "question-pericles" }],
    });

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

    describe("replaceForTopic (editor)", () => {
      const twoQuestions = aQuiz({
        id: "quiz-caesar",
        topicId: "topic-caesar",
        questions: [
          { id: "question-a", question: "¿Primera?", options: ["Sí", "No"], correctOptionIndex: 0 },
          {
            id: "question-b",
            question: "¿Segunda?",
            options: ["Una", "Otra", "La de más allá"],
            correctOptionIndex: 2,
            explanation: "Porque sí.",
          },
        ],
      });

      it("sustituye el quiz de un tema, conservando el orden de las preguntas", async () => {
        const repository = await createRepository([caesarQuiz, periclesQuiz]);

        await repository.replaceForTopic("topic-caesar", twoQuestions);

        expect(await repository.findByTopic("topic-caesar")).toEqual(twoQuestions);
      });

      it("crea el quiz de un tema que no tenía", async () => {
        const repository = await createRepository([periclesQuiz]);

        await repository.replaceForTopic("topic-caesar", twoQuestions);

        expect(await repository.findByTopic("topic-caesar")).toEqual(twoQuestions);
      });

      it("con null deja el tema sin quiz, sin tocar los de otros temas", async () => {
        const repository = await createRepository([caesarQuiz, periclesQuiz]);

        await repository.replaceForTopic("topic-caesar", null);

        expect(await repository.findByTopic("topic-caesar")).toBeNull();
        expect(await repository.findByTopic("topic-pericles")).toEqual(periclesQuiz);
      });
    });
  });
}
