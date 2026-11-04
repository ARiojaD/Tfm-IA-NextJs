"use client";

import { RECOMMENDATIONS_MAX } from "@/application/dto/TopicEditorInputs";
import type { Recommendation } from "@/domain/entities/Recommendation";
import { RECOMMENDATION_TYPES } from "@/domain/value-objects/RecommendationType";
import { RECOMMENDATION_TYPE_SINGULAR_LABELS } from "@/lib/recommendationTypeLabels";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { AddRowButton, ListErrors, RemoveRowButton, ROW_INPUT_CLASS, useRows } from "./listEditing";
import { useFormAction } from "./useFormAction";


const EMPTY_RECOMMENDATION = { id: "", type: "BOOK", title: "", creator: "", year: "", description: "" };

// Books, films and series to keep learning about the topic. The page groups them by type.
export function RecommendationsForm({
  action,
  topicId,
  recommendations,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  topicId: string;
  recommendations: Recommendation[];
}) {
  const { rows, add, remove, update, json } = useRows(
    recommendations.map(({ id, type, title, creator, year, description }) => ({
      id,
      type: type as string,
      title,
      creator,
      year: String(year),
      description,
    })),
  );
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors?.recommendations;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-describedby={errors ? "recommendations-errors" : undefined}>
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="recommendations" value={json} />

      {rows.length === 0 && <p className="text-sm text-muted">Este tema todavía no tiene recomendaciones.</p>}
      <ol className="space-y-4">
        {rows.map((row, index) => (
          <li key={row.key} className="space-y-2 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Recomendación {index + 1}</span>
              <RemoveRowButton label={`Quitar la recomendación ${index + 1}`} onClick={() => remove(row.key)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <select
                aria-label={`Tipo de la recomendación ${index + 1}`}
                value={row.type}
                onChange={(event) => update(row.key, { type: event.target.value })}
                className={ROW_INPUT_CLASS}
              >
                {RECOMMENDATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {RECOMMENDATION_TYPE_SINGULAR_LABELS[type]}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Título de la recomendación ${index + 1}`}
                placeholder="Título"
                maxLength={150}
                value={row.title}
                onChange={(event) => update(row.key, { title: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <input
                aria-label={`Autor o director de la recomendación ${index + 1}`}
                placeholder="Autor o director"
                maxLength={120}
                value={row.creator}
                onChange={(event) => update(row.key, { creator: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
              <input
                aria-label={`Año de la recomendación ${index + 1}`}
                placeholder="Año"
                inputMode="numeric"
                maxLength={4}
                value={row.year}
                onChange={(event) => update(row.key, { year: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
            </div>
            <textarea
              aria-label={`Descripción de la recomendación ${index + 1}`}
              placeholder="Por qué la recomiendas"
              rows={2}
              maxLength={500}
              value={row.description}
              onChange={(event) => update(row.key, { description: event.target.value })}
              className={`${ROW_INPUT_CLASS} resize-y`}
            />
          </li>
        ))}
      </ol>

      <ListErrors id="recommendations-errors" errors={errors} />
      <AddRowButton
        label="Añadir recomendación"
        disabled={rows.length >= RECOMMENDATIONS_MAX}
        onClick={() => add(EMPTY_RECOMMENDATION)}
      />
      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
