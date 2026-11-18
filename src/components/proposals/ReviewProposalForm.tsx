"use client";

import { useState } from "react";
import { PROPOSAL_REVIEW_NOTE_MAX_LENGTH } from "@/domain/entities/Proposal";
import { TextAreaField } from "../admin/AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "../admin/adminFormState";
import { useFormAction } from "../admin/useFormAction";

// La decisión del administrador sobre una propuesta. La nota es opcional para aprobar y obligatoria para
// rechazar: el usuario la lee en «Mis propuestas».
export function ReviewProposalForm({
  action,
  proposalId,
  approveLabel,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  proposalId: string;
  approveLabel: string;
}) {
  const [note, setNote] = useState("");
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <input type="hidden" name="proposalId" value={proposalId} />
      <TextAreaField
        id={`review-note-${proposalId}`}
        name="note"
        label="Respuesta para quien la propuso"
        hint="Opcional al aprobar; obligatoria al rechazar."
        rows={2}
        maxLength={PROPOSAL_REVIEW_NOTE_MAX_LENGTH}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        errors={state.fieldErrors?.note}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="decision"
          value="approve"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {approveLabel}
        </button>
        <button
          type="submit"
          name="decision"
          value="reject"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-danger hover:text-danger disabled:opacity-60"
        >
          Rechazar
        </button>
        <div aria-live="polite" className="text-sm text-danger">
          {state.formErrors?.map((message) => <p key={message}>{message}</p>)}
        </div>
      </div>
    </form>
  );
}
