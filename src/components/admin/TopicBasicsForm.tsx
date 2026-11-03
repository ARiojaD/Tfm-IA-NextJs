"use client";

import { useActionState, useState } from "react";
import { TOPIC_SUMMARY_MAX_LENGTH, TOPIC_TITLE_MAX_LENGTH } from "@/application/dto/TopicEditorInputs";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { TOPIC_CATEGORIES } from "@/domain/value-objects/TopicCategory";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { AuthField } from "../auth/AuthField";
import { SaveBar, SelectField, TextAreaField } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";

// The form values: what the inputs hold, all strings (years without sign, plus a.C./d.C.).
export interface TopicBasicsValues {
  title: string;
  era: string;
  category: string;
  summary: string;
  startYear: string;
  startEra: string;
  startMonth: string;
  endYear: string;
  endEra: string;
  endMonth: string;
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Title, civilization, category, summary and period: to create a topic and later to edit them. The inputs
// are controlled, so a failed save never wipes what the admin typed. maxLength only helps: the server
// (TopicEditorInputs) validates everything again.
export function TopicBasicsForm({
  action,
  initialValues,
  topicId,
  submitLabel,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  initialValues: TopicBasicsValues;
  topicId?: string;
  submitLabel: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [state, formAction, isPending] = useActionState(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors ?? {};
  const field = (name: keyof TopicBasicsValues) => ({
    name,
    value: values[name],
    onChange: (event: { target: { value: string } }) => setValues({ ...values, [name]: event.target.value }),
  });

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {topicId && <input type="hidden" name="topicId" value={topicId} />}

      <AuthField id="topic-title" label="Título" maxLength={TOPIC_TITLE_MAX_LENGTH} errors={errors.title} {...field("title")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="topic-era"
          label="Civilización"
          hint="Decide en qué página aparece el tema."
          errors={errors.era}
          {...field("era")}
        >
          {HISTORICAL_ERAS.map((era) => (
            <option key={era} value={era}>
              {ERA_LABELS[era]}
            </option>
          ))}
        </SelectField>
        <SelectField id="topic-category" label="Categoría" errors={errors.category} {...field("category")}>
          {TOPIC_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </SelectField>
      </div>

      <TextAreaField
        id="topic-summary"
        label="Resumen"
        hint="Una o dos frases: se ve en las tarjetas y bajo el título."
        rows={2}
        maxLength={TOPIC_SUMMARY_MAX_LENGTH}
        errors={errors.summary}
        {...field("summary")}
      />

      <PeriodFields
        legend="Inicio"
        prefix="start"
        field={field}
        errors={errors}
        hint="El año en que empieza: el nacimiento de un personaje, el inicio de una guerra, la fundación de una ciudad."
      />
      <PeriodFields
        legend="Fin (opcional)"
        prefix="end"
        field={field}
        errors={errors}
        hint="Déjalo vacío para un hecho de un solo año o para una ciudad que sigue existiendo."
      />

      <SaveBar state={state} isPending={isPending} label={submitLabel} />
    </form>
  );
}

function PeriodFields({
  legend,
  prefix,
  hint,
  field,
  errors,
}: {
  legend: string;
  prefix: "start" | "end";
  hint: string;
  field: (name: keyof TopicBasicsValues) => { name: string; value: string; onChange: (event: { target: { value: string } }) => void };
  errors: Record<string, string[]>;
}) {
  const year = `${prefix}Year` as const;
  const era = `${prefix}Era` as const;
  const month = `${prefix}Month` as const;

  return (
    <fieldset className="rounded-2xl border border-border p-4">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      <p className="text-xs text-muted">{hint}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <AuthField id={`topic-${year}`} label="Año" inputMode="numeric" maxLength={4} errors={errors[year]} {...field(year)} />
        <SelectField id={`topic-${era}`} label="Era" errors={errors[era]} {...field(era)}>
          <option value="BC">a.C.</option>
          <option value="AD">d.C.</option>
        </SelectField>
        <SelectField id={`topic-${month}`} label="Mes (opcional)" errors={errors[month]} {...field(month)}>
          <option value="">Sin mes</option>
          {MONTHS.map((name, index) => (
            <option key={name} value={String(index + 1)}>
              {name}
            </option>
          ))}
        </SelectField>
      </div>
    </fieldset>
  );
}
