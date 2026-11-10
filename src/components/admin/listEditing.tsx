"use client";

import { useState } from "react";

// Shared pieces of the editor sections that edit a list (timeline, quiz, recommendations). Each row has
// a stable `key` for React, so removing one row never shifts what was typed in the others; the key is
// dropped before sending.

export const ROW_INPUT_CLASS =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

type Keyed<Row> = Row & { key: string };

export function useRows<Row extends object>(initial: Row[]) {
  // The initial rows are rendered on the server too: their keys must be the same there and in the browser
  // (a random one would differ and break hydration), so they use their position. Rows added later exist
  // only in the browser and get a random key.
  const [rows, setRows] = useState<Keyed<Row>[]>(() => initial.map((row, index) => ({ ...row, key: `row-${index}` })));

  return {
    rows,
    add: (row: Row) => setRows([...rows, { ...row, key: crypto.randomUUID() }]),
    // From the current rows, not this render's: the AI takes seconds and the admin may keep typing meanwhile.
    addMany: (newRows: Row[]) => setRows((current) => [...current, ...newRows.map((row) => ({ ...row, key: crypto.randomUUID() }))]),
    remove: (key: string) => setRows(rows.filter((row) => row.key !== key)),
    update: (key: string, change: Partial<Row>) => setRows(rows.map((row) => (row.key === key ? { ...row, ...change } : row))),
    // What the hidden field sends: the rows without their React keys.
    json: JSON.stringify(rows, (name, value: unknown) => (name === "key" ? undefined : value)),
  };
}

export function ListErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors) return null;
  return (
    <ul id={id} className="space-y-1 text-xs text-danger">
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

export function AddRowButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-foreground/30 disabled:opacity-50"
    >
      ＋ {label}
    </button>
  );
}

export function RemoveRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-danger" aria-label={label}>
      Quitar
    </button>
  );
}
