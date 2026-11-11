"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidProposalError } from "@/application/errors/InvalidProposalError";
import { ProposalAlreadyReviewedError } from "@/application/errors/ProposalAlreadyReviewedError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { AdminFormState } from "@/components/admin/adminFormState";
import { getContainer } from "@/composition/container";

// Server Action fina para la bandeja de propuestas: el caso de uso comprueba el rol ADMIN, limita, valida
// y aplica la propuesta. Un tema nuevo aprobado abre su borrador en el editor, para completarlo.
export async function reviewProposal(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const result = await getContainer().reviewProposal.execute({
    proposalId: formData.get("proposalId"),
    decision: formData.get("decision"),
    note: formData.get("note"),
  });

  if (result.success) {
    if (result.data.createdTopicId) {
      redirect(`/admin/temas/${result.data.createdTopicId}`);
    }
    refresh(); // La propuesta revisada sale de la bandeja.
    return { status: "success" };
  }

  const error = result.error;
  if (error instanceof InvalidProposalError) {
    return { status: "error", fieldErrors: error.fieldErrors, formErrors: error.formErrors };
  }
  const message =
    error instanceof AuthenticationRequiredError
      ? "Tu sesión ha terminado. Inicia sesión de nuevo."
      : error instanceof AdminRequiredError
        ? "No tienes permiso para hacer esto."
        : error instanceof RateLimitExceededError
          ? `Has hecho demasiados cambios seguidos. Espera ${error.retryAfterSeconds} s y vuelve a intentarlo.`
          : error instanceof ProposalAlreadyReviewedError
            ? "Esta propuesta ya se revisó."
            : "No se ha podido revisar. Puede que la propuesta o su tema ya no existan.";
  return { status: "error", formErrors: [message] };
}
