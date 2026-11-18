"use client";

import { useActionState } from "react";
import type { EncyclopediaAnswer } from "@/application/use-cases/AskEncyclopediaUseCase";
import { AnswerView } from "./AnswerView";

export interface AskFormState {
  question: string;
  answer?: EncyclopediaAnswer;
  fieldError?: string;
  formError?: string;
}

const INITIAL_STATE: AskFormState = { question: "" };
const QUESTION_MAX_LENGTH = 300;

// maxLength solo ayuda al visitante; la validación de verdad está en el servidor (AskEncyclopediaUseCase).
// Tras una acción, React resetea el formulario a defaultValue, que es la pregunta recién hecha.
export function AskForm({
  action,
  initialQuestion = "",
}: {
  action: (state: AskFormState, formData: FormData) => Promise<AskFormState>;
  initialQuestion?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, { ...INITIAL_STATE, question: initialQuestion });

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-3xl border border-border bg-surface p-5 sm:p-6" noValidate>
        <label htmlFor="question" className="text-sm font-medium">
          Tu pregunta
        </label>
        <textarea
          id="question"
          name="question"
          defaultValue={state.question}
          maxLength={QUESTION_MAX_LENGTH}
          rows={3}
          placeholder="¿Por qué cruzó César el Rubicón?"
          aria-invalid={Boolean(state.fieldError)}
          aria-describedby={state.fieldError ? "question-error" : undefined}
          className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-6 outline-none focus:border-accent aria-invalid:border-danger"
        />
        {state.fieldError && (
          <p id="question-error" className="mt-1.5 text-xs text-danger">
            {state.fieldError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
          >
            {isPending ? "Buscando en la enciclopedia…" : "Preguntar"}
          </button>
          {state.formError && <p className="text-sm text-danger">{state.formError}</p>}
        </div>
      </form>

      <section aria-live="polite" aria-label="Respuesta">
        {state.answer && !isPending && (
          <div className="rounded-3xl border border-border bg-surface p-5 sm:p-8">
            <AnswerView answer={state.answer} />
          </div>
        )}
      </section>
    </div>
  );
}
