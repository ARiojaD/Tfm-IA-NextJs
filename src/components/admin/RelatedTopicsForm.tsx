"use client";

import { useState } from "react";
import { RELATED_TOPICS_MAX } from "@/application/dto/TopicEditorInputs";
import type { TopicOption } from "@/application/use-cases/GetTopicForEditingUseCase";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { ERA_LABELS } from "@/lib/eraLabels";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { ListErrors } from "./listEditing";
import { useFormAction } from "./useFormAction";

// "Sigue explorando": the other topics, by civilization, to tick. The link is saved in both directions.
// Drafts can be ticked; the public page shows a related topic only once it is published.
export function RelatedTopicsForm({
  action,
  topicId,
  relatedTopicIds,
  otherTopics,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  topicId: string;
  relatedTopicIds: string[];
  otherTopics: TopicOption[];
}) {
  const [selected, setSelected] = useState(relatedTopicIds);
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors?.relatedTopicIds;
  const toggle = (id: string, checked: boolean) =>
    setSelected(checked ? [...selected, id] : selected.filter((candidate) => candidate !== id));

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="relatedTopicIds" value={JSON.stringify(selected)} />

      {otherTopics.length === 0 && <p className="text-sm text-muted">Todavía no hay otros temas.</p>}
      {HISTORICAL_ERAS.map((era) => {
        const topics = otherTopics.filter((topic) => topic.era === era);
        if (topics.length === 0) return null;
        return (
          <fieldset key={era}>
            <legend className="text-sm font-medium">{ERA_LABELS[era]}</legend>
            <ul className="mt-2 space-y-1.5">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(topic.id)}
                      disabled={!selected.includes(topic.id) && selected.length >= RELATED_TOPICS_MAX}
                      onChange={(event) => toggle(topic.id, event.target.checked)}
                      className="accent-accent"
                    />
                    {topic.title}
                    {topic.status === "DRAFT" && <span className="text-xs text-muted">(borrador)</span>}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        );
      })}

      <ListErrors id="related-errors" errors={errors} />
      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
