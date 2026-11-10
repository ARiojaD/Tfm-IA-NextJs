"use client";

import { useState, useTransition } from "react";

export type AiDraftResult<Row> = { status: "success"; rows: Row[] } | { status: "error"; message: string };

// Asks the AI for rows and hands them to the list, which adds them below the existing ones. Nothing is
// saved here: the rows are one more edit of the form, until the administrator reviews them and saves.
export function AiDraftButton<Row>({
  action,
  topicId,
  onDraft,
}: {
  action: (topicId: string) => Promise<AiDraftResult<Row>>;
  topicId: string;
  // Adds the rows that fit in the list and returns how many it added.
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
