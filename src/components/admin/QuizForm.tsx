"use client";

import { QUIZ_OPTIONS_MAX, QUIZ_OPTIONS_MIN, QUIZ_QUESTIONS_MAX } from "@/application/dto/TopicEditorInputs";
import type { Quiz } from "@/domain/entities/Quiz";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { AddRowButton, ListErrors, RemoveRowButton, ROW_INPUT_CLASS, useRows } from "./listEditing";
import { useFormAction } from "./useFormAction";

interface QuestionRow {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

const EMPTY_QUESTION: QuestionRow = { id: "", question: "", options: ["", ""], correctOptionIndex: 0, explanation: "" };

// The topic's quiz: questions in order, each with 2–4 options and the correct one marked. The correct
// answers stay on the server: the public page only gets the questions (PublicQuiz).
export function QuizForm({
  action,
  topicId,
  quiz,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  topicId: string;
  quiz: Quiz | null;
}) {
  const { rows, add, remove, update, json } = useRows<QuestionRow>(
    (quiz?.questions ?? []).map((question) => ({ ...question, explanation: question.explanation ?? "" })),
  );
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors?.questions;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-describedby={errors ? "quiz-errors" : undefined}>
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="questions" value={json} />

      {rows.length === 0 && <p className="text-sm text-muted">Este tema todavía no tiene quiz. Sin preguntas, no se muestra.</p>}
      <ol className="space-y-4">
        {rows.map((row, index) => {
          const number = index + 1;
          const setOption = (optionIndex: number, value: string) =>
            update(row.key, { options: row.options.map((option, i) => (i === optionIndex ? value : option)) });
          const removeOption = (optionIndex: number) =>
            update(row.key, {
              options: row.options.filter((_, i) => i !== optionIndex),
              // The marked answer follows its option; if it was the removed one, the first is marked.
              correctOptionIndex:
                row.correctOptionIndex === optionIndex ? 0 : row.correctOptionIndex - (row.correctOptionIndex > optionIndex ? 1 : 0),
            });

          return (
            <li key={row.key} className="space-y-3 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Pregunta {number}</span>
                <RemoveRowButton label={`Quitar la pregunta ${number}`} onClick={() => remove(row.key)} />
              </div>
              <input
                aria-label={`Texto de la pregunta ${number}`}
                placeholder="¿Qué río cruzó César en el 49 a.C.?"
                maxLength={300}
                value={row.question}
                onChange={(event) => update(row.key, { question: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
              <fieldset className="space-y-2">
                <legend className="text-xs text-muted">Opciones: marca la correcta</legend>
                {row.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${row.key}`}
                      aria-label={`Marcar la opción ${optionIndex + 1} como correcta en la pregunta ${number}`}
                      checked={row.correctOptionIndex === optionIndex}
                      onChange={() => update(row.key, { correctOptionIndex: optionIndex })}
                      className="accent-accent"
                    />
                    <input
                      aria-label={`Opción ${optionIndex + 1} de la pregunta ${number}`}
                      placeholder={`Opción ${optionIndex + 1}`}
                      maxLength={150}
                      value={option}
                      onChange={(event) => setOption(optionIndex, event.target.value)}
                      className={ROW_INPUT_CLASS}
                    />
                    {row.options.length > QUIZ_OPTIONS_MIN && (
                      <RemoveRowButton
                        label={`Quitar la opción ${optionIndex + 1} de la pregunta ${number}`}
                        onClick={() => removeOption(optionIndex)}
                      />
                    )}
                  </div>
                ))}
                {row.options.length < QUIZ_OPTIONS_MAX && (
                  <button
                    type="button"
                    onClick={() => update(row.key, { options: [...row.options, ""] })}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    ＋ Añadir opción
                  </button>
                )}
              </fieldset>
              <input
                aria-label={`Explicación de la pregunta ${number}`}
                placeholder="Explicación tras responder (opcional)"
                maxLength={500}
                value={row.explanation}
                onChange={(event) => update(row.key, { explanation: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
            </li>
          );
        })}
      </ol>

      <ListErrors id="quiz-errors" errors={errors} />
      <AddRowButton label="Añadir pregunta" disabled={rows.length >= QUIZ_QUESTIONS_MAX} onClick={() => add(EMPTY_QUESTION)} />
      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
