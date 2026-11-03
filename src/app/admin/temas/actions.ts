"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicIsPublishedError } from "@/application/errors/TopicIsPublishedError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AdminFormState } from "@/components/admin/adminFormState";
import { getContainer } from "@/composition/container";
import type { Result } from "@/shared/Result";

// Thin Server Actions for the topic editor. Like every Server Action they are public POST endpoints:
// the use cases check the ADMIN role, rate-limit and validate; these only read the form and translate
// the Result into what the form shows, without internal details.

const BASICS_FIELDS = [
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
] as const;

function basicsFrom(formData: FormData) {
  return Object.fromEntries(BASICS_FIELDS.map((name) => [name, formData.get(name)]));
}

function errorState(error: Error): AdminFormState {
  if (error instanceof InvalidTopicError) {
    return { status: "error", fieldErrors: error.fieldErrors, formErrors: error.formErrors };
  }
  const message =
    error instanceof AuthenticationRequiredError
      ? "Tu sesión ha terminado. Inicia sesión de nuevo."
      : error instanceof AdminRequiredError
        ? "No tienes permiso para hacer esto."
        : error instanceof RateLimitExceededError
          ? `Has hecho demasiados cambios seguidos. Espera ${error.retryAfterSeconds} s y vuelve a intentarlo.`
          : error instanceof TopicNotFoundError
            ? "Este tema ya no existe."
            : error instanceof TopicIsPublishedError
              ? error.message
              : "No se ha podido guardar. Inténtalo de nuevo.";
  return { status: "error", formErrors: [message] };
}

function toState(result: Result<unknown, Error>): AdminFormState {
  if (!result.success) return errorState(result.error);
  refresh(); // Re-render the editor (and its status) with the saved data.
  return { status: "success" };
}

// A new topic goes straight to its editor, to write the introduction and the rest.
export async function createTopic(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const result = await getContainer().createTopic.execute(basicsFrom(formData));
  if (!result.success) return errorState(result.error);
  redirect(`/admin/temas/${result.data.id}`);
}

export async function updateTopicBasics(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateTopicBasics.execute({ topicId: formData.get("topicId"), ...basicsFrom(formData) }),
  );
}

export async function updateTopicIntroduction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateTopicIntroduction.execute({
      topicId: formData.get("topicId"),
      introduction: formData.get("introduction"),
    }),
  );
}

// Labels and values arrive as two lists in the same order: the n-th label goes with the n-th value.
export async function updateTopicKeyFacts(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const labels = formData.getAll("keyFactLabel");
  const values = formData.getAll("keyFactValue");
  return toState(
    await getContainer().updateTopicKeyFacts.execute({
      topicId: formData.get("topicId"),
      keyFacts: labels.map((label, index) => ({ label, value: values[index] ?? "" })),
    }),
  );
}

export async function changeTopicStatus(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().changeTopicStatus.execute({ topicId: formData.get("topicId"), status: formData.get("status") }),
  );
}

export async function deleteTopic(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const result = await getContainer().deleteTopic.execute({ topicId: formData.get("topicId") });
  if (!result.success) return errorState(result.error);
  redirect("/admin");
}
