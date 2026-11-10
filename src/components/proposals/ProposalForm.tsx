"use client";

import { useState } from "react";
import type { ProposalDraft } from "@/application/use-cases/DraftProposalUseCase";
import { PROPOSAL_KINDS, PROPOSAL_SOURCE_MAX_LENGTH, type ProposalKind } from "@/domain/entities/Proposal";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { RECOMMENDATION_TYPES } from "@/domain/value-objects/RecommendationType";
import { TOPIC_CATEGORIES } from "@/domain/value-objects/TopicCategory";
import { CATEGORY_LABELS } from "@/lib/categoryLabels";
import { ERA_LABELS } from "@/lib/eraLabels";
import { MONTHS } from "@/lib/formatHistoricalDate";
import { PROPOSAL_KIND_LABELS } from "@/lib/proposalLabels";
import { RECOMMENDATION_TYPE_SINGULAR_LABELS } from "@/lib/recommendationTypeLabels";
import { SaveBar, SelectField, TextAreaField } from "../admin/AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "../admin/adminFormState";
import { AuthField } from "../auth/AuthField";
import { useFormAction } from "../admin/useFormAction";
import { ProposalAiFill, type ProposalDraftResult } from "./ProposalAiFill";

export interface TopicChoice {
  slug: string;
  title: string;
  era: (typeof HISTORICAL_ERAS)[number];
}

const EMPTY_VALUES: Record<string, string> = {
  title: "",
  year: "",
  era: "BC",
  month: "",
  description: "",
  type: "BOOK",
  creator: "",
  message: "",
  // The civilization of a new topic: sent as "era" too, but kept apart from the a.C./d.C. of an event.
  topicEra: "ROMAN",
  category: "PEOPLE",
  summary: "",
  startYear: "",
  startEra: "BC",
  startMonth: "",
  endYear: "",
  endEra: "BC",
  endMonth: "",
  source: "",
};

// One form for the four kinds of proposal: only the fields of the chosen kind are shown and sent. The
// inputs are controlled, so a failed attempt keeps what was typed; a successful one clears it.
export function ProposalForm({
  action,
  draftAction,
  topics,
  initialTopicSlug,
  initialKind,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  draftAction: (kind: string, text: string) => Promise<ProposalDraftResult>;
  topics: TopicChoice[];
  initialTopicSlug?: string;
  initialKind?: ProposalKind;
}) {
  const [kind, setKind] = useState<ProposalKind>(initialKind ?? (initialTopicSlug ? "CORRECTION" : "EVENT"));
  const [topicSlug, setTopicSlug] = useState(initialTopicSlug ?? topics[0]?.slug ?? "");
  const [values, setValues] = useState(EMPTY_VALUES);
  const { state, onSubmit, isPending } = useFormAction(async (previous: AdminFormState, formData: FormData) => {
    const next = await action(previous, formData);
    if (next.status === "success") setValues(EMPTY_VALUES);
    return next;
  }, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors ?? {};
  const field = (name: string, key = name) => ({
    name,
    value: values[key],
    errors: errors[name],
    onChange: (event: { target: { value: string } }) => setValues({ ...values, [key]: event.target.value }),
  });
  const aboutTopic = kind !== "NEW_TOPIC";
  // From the current values: the AI takes seconds and the source may be written meanwhile.
  const applyDraft = (draft: ProposalDraft) => {
    if (draft.kind === "EVENT") {
      setValues((current) => ({ ...current, ...draft.values }));
      return;
    }
    const { civilization, ...rest } = draft.values;
    setValues((current) => ({ ...current, ...rest, topicEra: civilization }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <SelectField id="proposal-kind" name="kind" label="¿Qué quieres proponer?" value={kind} onChange={(event) => setKind(event.target.value as ProposalKind)}>
        {PROPOSAL_KINDS.map((option) => (
          <option key={option} value={option}>
            {PROPOSAL_KIND_LABELS[option]}
          </option>
        ))}
      </SelectField>

      {aboutTopic && (
        <SelectField
          id="proposal-topic"
          name="topicSlug"
          label="Tema"
          value={topicSlug}
          onChange={(event) => setTopicSlug(event.target.value)}
          errors={errors.topicSlug}
        >
          {HISTORICAL_ERAS.map((era) => {
            const ofEra = topics.filter((topic) => topic.era === era);
            return ofEra.length === 0 ? null : (
              <optgroup key={era} label={ERA_LABELS[era]}>
                {ofEra.map((topic) => (
                  <option key={topic.slug} value={topic.slug}>
                    {topic.title}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </SelectField>
      )}

      {(kind === "EVENT" || kind === "NEW_TOPIC") && <ProposalAiFill key={kind} kind={kind} action={draftAction} onDraft={applyDraft} />}

      {kind === "EVENT" && (
        <>
          <AuthField id="proposal-title" label="Título del evento" maxLength={120} {...field("title")} />
          <DateFields field={field} prefix="" />
          <TextAreaField id="proposal-description" label="Qué pasó" rows={3} maxLength={1000} {...field("description")} />
        </>
      )}

      {kind === "RECOMMENDATION" && (
        <>
          <SelectField id="proposal-type" label="Tipo" {...field("type")}>
            {RECOMMENDATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {RECOMMENDATION_TYPE_SINGULAR_LABELS[type]}
              </option>
            ))}
          </SelectField>
          <AuthField id="proposal-title" label="Título" maxLength={150} {...field("title")} />
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <AuthField id="proposal-creator" label="Autor o director" maxLength={120} {...field("creator")} />
            <AuthField id="proposal-year" label="Año" inputMode="numeric" maxLength={4} {...field("year")} />
          </div>
          <TextAreaField id="proposal-description" label="Por qué la recomiendas" rows={2} maxLength={500} {...field("description")} />
        </>
      )}

      {kind === "CORRECTION" && (
        <TextAreaField id="proposal-message" label="Qué hay que corregir" rows={4} maxLength={1000} {...field("message")} />
      )}

      {kind === "NEW_TOPIC" && (
        <>
          <AuthField id="proposal-title" label="Título del tema" maxLength={120} {...field("title")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField id="proposal-era" label="Civilización" {...field("era", "topicEra")}>
              {HISTORICAL_ERAS.map((era) => (
                <option key={era} value={era}>
                  {ERA_LABELS[era]}
                </option>
              ))}
            </SelectField>
            <SelectField id="proposal-category" label="Categoría" {...field("category")}>
              {TOPIC_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </SelectField>
          </div>
          <TextAreaField id="proposal-summary" label="Resumen" rows={2} maxLength={300} {...field("summary")} />
          <p className="text-sm font-medium">Inicio</p>
          <DateFields field={field} prefix="start" />
          <p className="text-sm font-medium">Fin (opcional)</p>
          <DateFields field={field} prefix="end" />
          <TextAreaField
            id="proposal-description"
            label="Descripción"
            hint="Lo que sabes del tema. Si se aprueba, será el punto de partida de su introducción."
            rows={6}
            maxLength={4000}
            {...field("description")}
          />
        </>
      )}

      <AuthField
        id="proposal-source"
        label="Fuente"
        hint="De dónde sale: un libro, un artículo o una web. Sirve para comprobarlo."
        maxLength={PROPOSAL_SOURCE_MAX_LENGTH}
        {...field("source")}
      />

      <SaveBar state={state} isPending={isPending} label="Enviar propuesta" />
      {state.status === "success" && (
        <p aria-live="polite" className="text-sm text-success">
          ¡Gracias! Un administrador la revisará.
        </p>
      )}
    </form>
  );
}

type FieldProps = (name: string) => {
  name: string;
  value: string;
  errors?: string[];
  onChange: (event: { target: { value: string } }) => void;
};

// Year, a.C./d.C. and optional month. Without prefix (an event) the names are year/era/month.
function DateFields({ field, prefix }: { field: FieldProps; prefix: "" | "start" | "end" }) {
  const name = (part: "Year" | "Era" | "Month") => (prefix === "" ? part.toLowerCase() : `${prefix}${part}`);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <AuthField id={`proposal-${name("Year")}`} label="Año" inputMode="numeric" maxLength={4} {...field(name("Year"))} />
      <SelectField id={`proposal-${name("Era")}`} label="Era" {...field(name("Era"))}>
        <option value="BC">a.C.</option>
        <option value="AD">d.C.</option>
      </SelectField>
      <SelectField id={`proposal-${name("Month")}`} label="Mes (opcional)" {...field(name("Month"))}>
        <option value="">Sin mes</option>
        {MONTHS.map((month, index) => (
          <option key={month} value={String(index + 1)}>
            {month}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
