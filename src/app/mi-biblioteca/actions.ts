"use server";

import { refresh } from "next/cache";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { Result } from "@/shared/Result";
import type { LibraryActionState } from "@/components/library/LibraryToggle";
import { getContainer } from "@/composition/container";

// Thin Server Actions for "Mi biblioteca": the use cases take the user from the session, rate-limit and
// validate; these only read the form and translate the Result. The user is never read from the form.

function toState(result: Result<unknown, Error>): LibraryActionState {
  if (result.success) {
    refresh(); // Re-render the page so the button (and the library) show the new state.
    return { status: "idle" };
  }
  if (result.error instanceof AuthenticationRequiredError) {
    return { status: "error", message: "Tu sesión ha terminado. Inicia sesión de nuevo." };
  }
  if (result.error instanceof RateLimitExceededError) {
    return {
      status: "error",
      message: `Has hecho demasiados cambios seguidos. Espera ${result.error.retryAfterSeconds} s y vuelve a intentarlo.`,
    };
  }
  if (result.error instanceof TopicNotFoundError) {
    return { status: "error", message: "Este tema ya no está disponible." };
  }
  return { status: "error", message: "No se ha podido actualizar tu biblioteca. Inténtalo de nuevo." };
}

export async function updateEraFollow(_previous: LibraryActionState, formData: FormData): Promise<LibraryActionState> {
  return toState(
    await getContainer().updateEraFollow.execute({ era: formData.get("era"), intent: formData.get("intent") }),
  );
}

export async function updateSavedTopic(_previous: LibraryActionState, formData: FormData): Promise<LibraryActionState> {
  return toState(
    await getContainer().updateSavedTopic.execute({
      topicSlug: formData.get("topicSlug"),
      intent: formData.get("intent"),
    }),
  );
}
