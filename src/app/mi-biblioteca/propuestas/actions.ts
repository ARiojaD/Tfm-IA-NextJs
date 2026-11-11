"use server";

import { refresh } from "next/cache";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidProposalError } from "@/application/errors/InvalidProposalError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicDraftError } from "@/application/errors/TopicDraftError";
import type { AdminFormState } from "@/components/admin/adminFormState";
import type { ProposalDraftResult } from "@/components/proposals/ProposalAiFill";
import { getContainer } from "@/composition/container";

// Los campos que envía cada tipo de propuesta. Solo se leen esos del formulario: el autor, el usuario y el
// estado salen del servidor (el caso de uso los rechazaría de todos modos).
const FIELDS_BY_KIND: Record<string, readonly string[]> = {
  EVENT: ["topicSlug", "title", "year", "era", "month", "description", "source"],
  RECOMMENDATION: ["topicSlug", "type", "title", "creator", "year", "description", "source"],
  CORRECTION: ["topicSlug", "message", "source"],
  NEW_TOPIC: [
    "title",
    "era",
    "category",
    "summary",
    "startYear",
    "startEra",
    "startMonth",
    "endYear",
    "endEra",
    "endMonth",
    "description",
    "source",
  ],
};

// Solo devuelve los campos para el formulario: no se envía nada hasta que el usuario lo revisa.
export async function draftProposal(kind: string, text: string): Promise<ProposalDraftResult> {
  const result = await getContainer().draftProposal.execute({ kind, text });

  if (result.success) return { status: "success", draft: result.data };
  const { error } = result;
  if (error instanceof TopicDraftError) return { status: "error", message: error.message };
  if (error instanceof InvalidProposalError) {
    return { status: "error", message: error.fieldErrors.text?.[0] ?? "No se ha podido leer el fragmento." };
  }
  if (error instanceof AuthenticationRequiredError) {
    return { status: "error", message: "Tu sesión ha terminado. Inicia sesión de nuevo." };
  }
  return { status: "error", message: `Has pedido muchos rellenados seguidos. Espera ${Math.ceil(error.retryAfterSeconds / 60)} min y vuelve a intentarlo.` };
}

export async function submitProposal(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const kind = formData.get("kind");
  const fields = typeof kind === "string" ? (FIELDS_BY_KIND[kind] ?? []) : [];
  const result = await getContainer().submitProposal.execute({
    kind,
    ...Object.fromEntries(fields.map((name) => [name, formData.get(name)])),
  });

  if (result.success) {
    refresh(); // La propuesta nueva aparece en la lista bajo el formulario.
    return { status: "success" };
  }
  if (result.error instanceof InvalidProposalError) {
    return { status: "error", fieldErrors: result.error.fieldErrors, formErrors: result.error.formErrors };
  }
  if (result.error instanceof AuthenticationRequiredError) {
    return { status: "error", formErrors: ["Tu sesión ha terminado. Inicia sesión de nuevo."] };
  }
  if (result.error instanceof RateLimitExceededError) {
    return {
      status: "error",
      formErrors: [`Has enviado muchas propuestas seguidas. Espera ${Math.ceil(result.error.retryAfterSeconds / 60)} min y vuelve a intentarlo.`],
    };
  }
  return { status: "error", formErrors: ["Ese tema ya no está disponible."] };
}
