"use client";

import { useState, useTransition } from "react";

export type AiDraftResult<Row> = { status: "success"; rows: Row[] } | { status: "error"; message: string };

// Pide filas a la IA y se las pasa a la lista, que las añade debajo de las que ya hay. Aquí no se guarda
// nada: las filas son un cambio más del formulario, hasta que el administrador las revisa y guarda.
export function AiDraftButton<Row>({
  action,
  topicId,
  onDraft,
}: {
  action: (topicId: string) => Promise<AiDraftResult<Row>>;
  topicId: string;
  // Añade las filas que caben en la lista y devuelve cuántas añadió.
  onDraft: (rows: Row[]) => number;
}) {
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const request = () => {
    setNotice(null);
    startTransition(async () => {
      const result = await action(topicId);
      if (result.status === "error") {
        setNotice({ kind: "error", text: result.message });
        return;
      }
      const added = onDraft(result.rows);
      setNotice(
        added > 0
          ? { kind: "success", text: `Propuestas de la IA añadidas: ${added}. Todavía no están guardadas: revísalas y pulsa Guardar.` }
          : { kind: "error", text: "La lista ya está completa: quita alguna fila para añadir propuestas." },
      );
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={request}
        className="rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-60"
      >
        {isPending ? "La IA está leyendo el tema…" : "✨ Proponer con IA"}
      </button>
      <p aria-live="polite" className="text-sm">
        {notice && <span className={notice.kind === "success" ? "text-success" : "text-danger"}>{notice.text}</span>}
      </p>
    </div>
  );
}
