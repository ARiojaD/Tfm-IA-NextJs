import type { Quiz } from "@/domain/entities/Quiz";

// The quiz as a player may see it: no correct answer, no explanation.
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

// Allowlist, not denylist: fields are copied explicitly, so a field added to Quiz later
// stays private unless it is deliberately added here.
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
