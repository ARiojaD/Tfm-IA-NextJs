"use client";

import { useState, useTransition } from "react";
import type { PublicQuiz } from "@/application/dto/PublicQuiz";

export type QuizAnswerState =
  | { status: "answered"; isCorrect: boolean; correctOptionIndex: number; explanation: string | null }
  | { status: "error"; message: string };

export interface AnswerQuestionInput {
  topicSlug: string;
  questionId: string;
  optionIndex: number;
}

interface QuestionProgress {
  selectedIndex: number;
  feedback?: Extract<QuizAnswerState, { status: "answered" }>;
  error?: string;
}

// Receives the quiz without solutions. Each answer is graded on the server through
// answerQuestion (a Server Action); only then does the browser learn the correct option.
export function QuizGame({
  quiz,
  topicSlug,
  answerQuestion,
}: {
  quiz: PublicQuiz;
  topicSlug: string;
  answerQuestion: (input: AnswerQuestionInput) => Promise<QuizAnswerState>;
}) {
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>({});
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const answered = quiz.questions.filter((question) => progress[question.id]?.feedback);
  const correctCount = answered.filter((question) => progress[question.id]?.feedback?.isCorrect).length;
  const isFinished = answered.length === quiz.questions.length;

  function choose(questionId: string, optionIndex: number) {
    setPendingQuestionId(questionId);
    setProgress((current) => ({ ...current, [questionId]: { selectedIndex: optionIndex } }));

    startTransition(async () => {
      const result = await answerQuestion({ topicSlug, questionId, optionIndex });
      setProgress((current) => ({
        ...current,
        [questionId]:
          result.status === "answered"
            ? { selectedIndex: optionIndex, feedback: result }
            : { selectedIndex: optionIndex, error: result.message },
      }));
      setPendingQuestionId(null);
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-8">
      <p className="mb-6 text-sm text-muted" aria-live="polite">
        Respondidas {answered.length} de {quiz.questions.length} · Aciertos {correctCount}
      </p>

      <ol className="space-y-10">
        {quiz.questions.map((question, questionIndex) => {
          const state = progress[question.id];
          const feedback = state?.feedback;
          const isPending = pendingQuestionId === question.id;
          const isLocked = Boolean(feedback) || isPending;

          return (
            <li key={question.id}>
              <p className="font-serif text-xl font-semibold">
                <span className="mr-2 text-accent">{questionIndex + 1}.</span>
                {question.question}
              </p>

              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <li key={option}>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => choose(question.id, optionIndex)}
                      className={optionClass(optionIndex, state, isPending)}
                    >
                      <span>{option}</span>
                      {feedback && optionIndex === feedback.correctOptionIndex && <span aria-label="Respuesta correcta">✓</span>}
                      {feedback && !feedback.isCorrect && optionIndex === state?.selectedIndex && (
                        <span aria-label="Tu respuesta">✗</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <div aria-live="polite">
                {feedback && (
                  <p className={`mt-3 text-sm leading-6 ${feedback.isCorrect ? "text-success" : "text-danger"}`}>
                    <strong>{feedback.isCorrect ? "¡Correcto!" : "No es correcto."}</strong>
                    {feedback.explanation && <span className="text-muted"> {feedback.explanation}</span>}
                  </p>
                )}
                {state?.error && <p className="mt-3 text-sm text-danger">{state.error}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {isFinished && (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-accent-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-2xl font-semibold" aria-live="polite">
            Has acertado {correctCount} de {quiz.questions.length}
            {correctCount === quiz.questions.length && " · ¡Ave, César!"}
          </p>
          <button
            type="button"
            onClick={() => setProgress({})}
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Volver a intentarlo
          </button>
        </div>
      )}
    </div>
  );
}

function optionClass(optionIndex: number, state: QuestionProgress | undefined, isPending: boolean): string {
  const base =
    "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default";
  const feedback = state?.feedback;

  if (feedback && optionIndex === feedback.correctOptionIndex) {
    return `${base} border-success bg-success-soft text-success`;
  }
  if (feedback && optionIndex === state?.selectedIndex) {
    return `${base} border-danger bg-danger-soft text-danger`;
  }
  if (isPending && optionIndex === state?.selectedIndex) {
    return `${base} animate-pulse border-accent bg-accent-soft`;
  }
  return `${base} border-border bg-background enabled:hover:border-foreground/30 disabled:opacity-60`;
}
