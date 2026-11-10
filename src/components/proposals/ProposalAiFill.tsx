"use client";

import { useState, useTransition } from "react";
import type { ProposalDraft } from "@/application/use-cases/DraftProposalUseCase";

export type ProposalDraftResult = { status: "success"; draft: ProposalDraft } | { status: "error"; message: string };

const FRAGMENT_MAX_LENGTH = 4000;

// Fills the form from a pasted fragment. It has no name, so the fragment is not sent with the proposal.
// Nothing is sent here either: the user reviews the fields and adds the source.
export function ProposalAiFill({
  kind,
  action,
  onDraft,
}: {
  kind: "EVENT" | "NEW_TOPIC";
  action: (kind: string, text: string) => Promise<ProposalDraftResult>;
  onDraft: (draft: ProposalDraft) => void;
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const request = () => {
    setNotice(null);
    startTransition(async () => {
      const result = await action(kind, text);
      if (result.status === "error") {
        setNotice({ kind: "error", text: result.message });
        return;
      }
      onDraft(result.draft);
      setNotice({ kind: "success", text: "Campos rellenados. Revísalos y añade la fuente antes de enviar." });
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
      <div>
        <label htmlFor="proposal-fragment" className="text-sm font-medium">
          Rellenar con IA (opcional)
        </label>
        <p className="mt-0.5 text-xs text-muted">Pega un fragmento de un libro o un artículo y la IA completará los campos.</p>
      </div>
      <textarea
        id="proposal-fragment"
        rows={4}
        maxLength={FRAGMENT_MAX_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-2.5 text-sm leading-6 outline-none focus:border-accent"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={request}
          className="rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-60"
        >
          {isPending ? "La IA está leyendo el fragmento…" : "✨ Rellenar con IA"}
        </button>
        <p aria-live="polite" className="text-sm">
          {notice && <span className={notice.kind === "success" ? "text-success" : "text-danger"}>{notice.text}</span>}
        </p>
      </div>
    </div>
  );
}
