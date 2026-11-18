"use client";

import { useState } from "react";

// Piezas comunes de las secciones del editor que editan una lista (cronología, quiz, recomendaciones).
// Cada fila tiene una `key` estable para React, así que quitar una nunca desplaza lo escrito en las demás;
// la key se quita antes de enviar.

export const ROW_INPUT_CLASS =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

type Keyed<Row> = Row & { key: string };

export function useRows<Row extends object>(initial: Row[]) {
  // Las filas iniciales también se renderizan en el servidor: su key tiene que ser la misma allí y en el
  // navegador (una aleatoria sería distinta y rompería la hidratación), así que usan su posición. Las
  // filas añadidas después solo existen en el navegador y reciben una key aleatoria.
  const [rows, setRows] = useState<Keyed<Row>[]>(() => initial.map((row, index) => ({ ...row, key: `row-${index}` })));

  return {
    rows,
    add: (row: Row) => setRows([...rows, { ...row, key: crypto.randomUUID() }]),
    // Sobre las filas actuales, no las de este render: la IA tarda segundos y el administrador puede seguir escribiendo.
    addMany: (newRows: Row[]) => setRows((current) => [...current, ...newRows.map((row) => ({ ...row, key: crypto.randomUUID() }))]),
    remove: (key: string) => setRows(rows.filter((row) => row.key !== key)),
    update: (key: string, change: Partial<Row>) => setRows(rows.map((row) => (row.key === key ? { ...row, ...change } : row))),
    // Lo que envía el campo oculto: las filas sin sus keys de React.
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
