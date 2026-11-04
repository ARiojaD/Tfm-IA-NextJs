"use client";

import { useActionState, useState } from "react";
import { KEY_FACTS_MAX } from "@/application/dto/TopicEditorInputs";
import type { KeyFact } from "@/domain/value-objects/KeyFact";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

// The fact sheet as editable rows. Each row sends a label and a value with the same names
// (keyFactLabel / keyFactValue), in order; rows left empty are dropped by the server.
export function KeyFactsForm({
  action,
  topicId,
  keyFacts,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  topicId: string;
  keyFacts: KeyFact[];
}) {
  // Each row keeps a stable key, so removing one row does not shift the text typed in the others. The
  // initial rows use their position (the same on the server and in the browser); added rows a random one.
  const [rows, setRows] = useState(() =>
    (keyFacts.length > 0 ? keyFacts : [{ label: "", value: "" }]).map((fact, index) => ({ ...fact, key: `row-${index}` })),
  );
  const [state, formAction, isPending] = useActionState(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors?.keyFacts;

  const update = (key: string, change: Partial<KeyFact>) =>
    setRows(rows.map((row) => (row.key === key ? { ...row, ...change } : row)));

  return (
    <form action={formAction} className="space-y-4" noValidate aria-describedby={errors ? "key-facts-errors" : undefined}>
      <input type="hidden" name="topicId" value={topicId} />

      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={row.key} className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-center">
            <input
              name="keyFactLabel"
              aria-label={`Etiqueta del dato ${index + 1}`}
              placeholder="Etiqueta (p. ej. Nacimiento)"
              maxLength={40}
              value={row.label}
              onChange={(event) => update(row.key, { label: event.target.value })}
              className={INPUT_CLASS}
            />
            <input
              name="keyFactValue"
              aria-label={`Valor del dato ${index + 1}`}
              placeholder="Valor (p. ej. 100 a.C., Roma)"
              maxLength={200}
              value={row.value}
              onChange={(event) => update(row.key, { value: event.target.value })}
              className={INPUT_CLASS}
            />
            <button
              type="button"
              onClick={() => setRows(rows.filter((candidate) => candidate.key !== row.key))}
              className="justify-self-start rounded-full px-3 py-1.5 text-sm text-muted hover:text-danger"
              aria-label={`Quitar el dato ${index + 1}`}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      {errors && (
        <ul id="key-facts-errors" className="space-y-1 text-xs text-danger">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={rows.length >= KEY_FACTS_MAX}
        onClick={() => setRows([...rows, { label: "", value: "", key: crypto.randomUUID() }])}
        className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-foreground/30 disabled:opacity-50"
      >
        ＋ Añadir dato
      </button>

      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
