"use server";

import { refresh } from "next/cache";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidProposalError } from "@/application/errors/InvalidProposalError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { AdminFormState } from "@/components/admin/adminFormState";
import { getContainer } from "@/composition/container";

// The fields each kind of proposal sends. Only those are read from the form: the author, the user and
// the status come from the server (the use case would reject them anyway).
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

export async function submitProposal(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const kind = formData.get("kind");
  const fields = typeof kind === "string" ? (FIELDS_BY_KIND[kind] ?? []) : [];
  const result = await getContainer().submitProposal.execute({
    kind,
    ...Object.fromEntries(fields.map((name) => [name, formData.get(name)])),
  });

  if (result.success) {
    refresh(); // The new proposal appears in the list below the form.
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
