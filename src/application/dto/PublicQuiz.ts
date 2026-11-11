import type { Quiz } from "@/domain/entities/Quiz";

// El quiz tal como puede verlo un jugador: sin la respuesta correcta ni la explicación.
export interface PublicQuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface PublicQuiz {
  id: string;
  topicId: string;
  questions: PublicQuizQuestion[];
}

// Lista de lo permitido, no de lo prohibido: los campos se copian uno a uno, así que un campo que se añada
// a `Quiz` en el futuro sigue siendo privado salvo que se añada aquí a propósito.
export function toPublicQuiz(quiz: Quiz): PublicQuiz {
  return {
    id: quiz.id,
    topicId: quiz.topicId,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: [...question.options],
    })),
  };
}
