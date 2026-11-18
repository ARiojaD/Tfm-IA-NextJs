"use client";

import { EVENTS_MAX } from "@/application/dto/TopicEditorInputs";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import type { EventDraftRow } from "@/domain/entities/TopicDrafts";
import { MONTHS } from "@/lib/formatHistoricalDate";
import { toDateFields } from "@/lib/topicBasicsValues";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { AiDraftButton, type AiDraftResult } from "./AiDraftButton";
import { AddRowButton, ListErrors, RemoveRowButton, ROW_INPUT_CLASS, useRows } from "./listEditing";
import { useFormAction } from "./useFormAction";

const EMPTY_EVENT = { id: "", title: "", year: "", era: "BC", month: "", description: "" };

// La cronología del tema. El orden da igual: la página ordena los eventos por fecha.
export function EventsForm({
  action,
  draftAction,
  topicId,
  events,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  draftAction: (topicId: string) => Promise<AiDraftResult<EventDraftRow>>;
  topicId: string;
  events: HistoricalEvent[];
}) {
  const { rows, add, addMany, remove, update, json } = useRows(
    events.map((event) => {
      const date = toDateFields(event.date);
      return { id: event.id, title: event.title, year: date.year, era: date.era, month: date.month, description: event.description };
    }),
  );
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors?.events;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-describedby={errors ? "events-errors" : undefined}>
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="events" value={json} />

      {rows.length === 0 && <p className="text-sm text-muted">Este tema todavía no tiene cronología.</p>}
      <ol className="space-y-4">
        {rows.map((row, index) => (
          <li key={row.key} className="space-y-2 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Evento {index + 1}</span>
              <RemoveRowButton label={`Quitar el evento ${index + 1}`} onClick={() => remove(row.key)} />
            </div>
            <input
              aria-label={`Título del evento ${index + 1}`}
              placeholder="Título (p. ej. Batalla de Farsalia)"
              maxLength={120}
              value={row.title}
              onChange={(event) => update(row.key, { title: event.target.value })}
              className={ROW_INPUT_CLASS}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                aria-label={`Año del evento ${index + 1}`}
                placeholder="Año"
                inputMode="numeric"
                maxLength={4}
                value={row.year}
                onChange={(event) => update(row.key, { year: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
              <select
                aria-label={`Era del evento ${index + 1}`}
                value={row.era}
                onChange={(event) => update(row.key, { era: event.target.value })}
                className={ROW_INPUT_CLASS}
              >
                <option value="BC">a.C.</option>
                <option value="AD">d.C.</option>
              </select>
              <select
                aria-label={`Mes del evento ${index + 1}`}
                value={row.month}
                onChange={(event) => update(row.key, { month: event.target.value })}
                className={ROW_INPUT_CLASS}
              >
                <option value="">Sin mes</option>
                {MONTHS.map((name, monthIndex) => (
                  <option key={name} value={String(monthIndex + 1)}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              aria-label={`Descripción del evento ${index + 1}`}
              placeholder="Qué pasó, en una o dos frases"
              rows={2}
              maxLength={1000}
              value={row.description}
              onChange={(event) => update(row.key, { description: event.target.value })}
              className={`${ROW_INPUT_CLASS} resize-y`}
            />
          </li>
        ))}
      </ol>

      <ListErrors id="events-errors" errors={errors} />
      <div className="flex flex-wrap items-center gap-3">
        <AddRowButton label="Añadir evento" disabled={rows.length >= EVENTS_MAX} onClick={() => add(EMPTY_EVENT)} />
        <AiDraftButton
          action={draftAction}
          topicId={topicId}
          onDraft={(drafts) => {
            const fitting = drafts.slice(0, EVENTS_MAX - rows.length);
            addMany(fitting);
            return fitting.length;
          }}
        />
      </div>
      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
