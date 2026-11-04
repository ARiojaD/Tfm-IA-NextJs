"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { TopicStatus } from "@/domain/value-objects/TopicStatus";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { TopicStatusBadge } from "./TopicStatusBadge";

type Action = (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;

// The top of the editor: the state of the topic and what can be done with it. Publishing an incomplete
// topic lists what is missing; deleting is only offered for drafts, and asks for confirmation.
export function TopicStatusPanel({
  topicId,
  status,
  previewHref,
  publicHref,
  changeStatus,
  deleteTopic,
}: {
  topicId: string;
  status: TopicStatus;
  previewHref: string;
  publicHref: string;
  changeStatus: Action;
  deleteTopic: Action;
}) {
  const [statusState, statusAction, isChangingStatus] = useActionState(changeStatus, INITIAL_ADMIN_FORM_STATE);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteTopic, INITIAL_ADMIN_FORM_STATE);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isDraft = status === "DRAFT";
  const messages = [...(statusState.formErrors ?? []), ...(deleteState.formErrors ?? [])];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <TopicStatusBadge status={status} />
        <p className="text-sm text-muted">
          {isDraft ? "Solo lo ven los administradores." : "Visible para todo el mundo."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form action={statusAction}>
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="status" value={isDraft ? "PUBLISHED" : "DRAFT"} />
          <button
            type="submit"
            disabled={isChangingStatus}
            className={
              isDraft
                ? "inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
                : "inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-foreground/30 disabled:opacity-60"
            }
          >
            {isChangingStatus ? "Cambiando…" : isDraft ? "Publicar" : "Despublicar"}
          </button>
        </form>

        <Link href={previewHref} className="text-sm font-medium text-accent hover:underline">
          Vista previa
        </Link>
        {!isDraft && (
          <Link href={publicHref} className="text-sm font-medium text-accent hover:underline">
            Ver en la web
          </Link>
        )}

        {isDraft &&
          (confirmingDelete ? (
            <form action={deleteAction} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="topicId" value={topicId} />
              <span className="text-sm">¿Borrar el borrador para siempre?</span>
              <button
                type="submit"
                disabled={isDeleting}
                className="rounded-full bg-danger px-4 py-1.5 text-sm font-medium text-background disabled:opacity-60"
              >
                {isDeleting ? "Borrando…" : "Sí, borrar"}
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)} className="text-sm text-muted hover:underline">
                Cancelar
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setConfirmingDelete(true)} className="text-sm text-muted hover:text-danger">
              Borrar borrador
            </button>
          ))}
      </div>

      {statusState.notices && (
        <ul aria-live="polite" className="mt-4 space-y-1 text-sm text-muted">
          {statusState.notices.map((notice) => (
            <li key={notice}>ℹ️ {notice}</li>
          ))}
        </ul>
      )}
      {messages.length > 0 && (
        <ul aria-live="polite" className="mt-4 space-y-1 text-sm text-danger">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
