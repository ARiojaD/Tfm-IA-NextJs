"use client";

import { ERA_MILESTONES_MAX } from "@/application/dto/TimelineEditorInputs";
import type { MilestoneTopicOption } from "@/application/use-cases/GetEraTimelineForEditingUseCase";
import { MILESTONE_DESCRIPTION_MAX_LENGTH, MILESTONE_TITLE_MAX_LENGTH, type TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { MONTHS } from "@/lib/formatHistoricalDate";
import { toDateFields } from "@/lib/topicBasicsValues";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { AddRowButton, ListErrors, RemoveRowButton, ROW_INPUT_CLASS, useRows } from "./listEditing";
import { useFormAction } from "./useFormAction";

const EMPTY_MILESTONE = { id: "", title: "", year: "", era: "BC", month: "", description: "", topicId: "" };

// La cronología completa de una civilización, como una lista de hitos. Igual que la cronología de un tema:
// las fechas se escriben como las escribe la gente (año sin signo y a.C./d.C.) y el orden de la lista no
// importa, porque la página pública los ordena por fecha. Cada hito puede enlazar a un tema de la
// civilización, o a ninguno todavía.
export function MilestonesForm({
  action,
  era,
  milestones,
  topicOptions,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  era: HistoricalEra;
  milestones: TimelineMilestone[];
  topicOptions: MilestoneTopicOption[];
}) {
  const { rows, add, remove, update, json } = useRows(
    milestones.map((milestone) => {
      const date = toDateFields(milestone.date);
      return {
        id: milestone.id,
        title: milestone.title,
        year: date.year,
        era: date.era,
        month: date.month,
        description: milestone.description,
        topicId: milestone.topicId ?? "",
      };
    }),
  );
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors?.milestones;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate aria-describedby={errors ? "milestones-errors" : undefined}>
      <input type="hidden" name="era" value={era} />
      <input type="hidden" name="milestones" value={json} />

      {rows.length === 0 && <p className="text-sm text-muted">Esta civilización todavía no tiene cronología.</p>}
      <ol className="space-y-4">
        {rows.map((row, index) => (
          <li key={row.key} className="space-y-2 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Hito {index + 1}</span>
              <RemoveRowButton label={`Quitar el hito ${index + 1}`} onClick={() => remove(row.key)} />
            </div>
            <input
              aria-label={`Título del hito ${index + 1}`}
              placeholder="Título (p. ej. Primera guerra púnica)"
              maxLength={MILESTONE_TITLE_MAX_LENGTH}
              value={row.title}
              onChange={(event) => update(row.key, { title: event.target.value })}
              className={ROW_INPUT_CLASS}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                aria-label={`Año del hito ${index + 1}`}
                placeholder="Año"
                inputMode="numeric"
                maxLength={4}
                value={row.year}
                onChange={(event) => update(row.key, { year: event.target.value })}
                className={ROW_INPUT_CLASS}
              />
              <select
                aria-label={`Era del hito ${index + 1}`}
                value={row.era}
                onChange={(event) => update(row.key, { era: event.target.value })}
                className={ROW_INPUT_CLASS}
              >
                <option value="BC">a.C.</option>
                <option value="AD">d.C.</option>
              </select>
              <select
                aria-label={`Mes del hito ${index + 1}`}
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
              aria-label={`Descripción del hito ${index + 1}`}
              placeholder="Una frase que lo resuma: el detalle va en el tema"
              rows={2}
              maxLength={MILESTONE_DESCRIPTION_MAX_LENGTH}
              value={row.description}
              onChange={(event) => update(row.key, { description: event.target.value })}
              className={`${ROW_INPUT_CLASS} resize-y`}
            />
            <select
              aria-label={`Tema enlazado al hito ${index + 1}`}
              value={row.topicId}
              onChange={(event) => update(row.key, { topicId: event.target.value })}
              className={ROW_INPUT_CLASS}
            >
              <option value="">Sin tema todavía</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                  {topic.status === "DRAFT" ? " (borrador)" : ""}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ol>

      <ListErrors id="milestones-errors" errors={errors} />
      <AddRowButton label="Añadir hito" disabled={rows.length >= ERA_MILESTONES_MAX} onClick={() => add(EMPTY_MILESTONE)} />
      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
