import { refresh } from "next/cache";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicIsPublishedError } from "@/application/errors/TopicIsPublishedError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AdminFormState } from "@/components/admin/adminFormState";
import type { Result } from "@/shared/Result";

// Lo que comparten las Server Actions de los editores del panel (temas y cronología): leer las listas que
// llegan como JSON y traducir el `Result` de un caso de uso a lo que muestra el formulario. No es un
// archivo "use server": un archivo así solo puede exportar acciones, y esto son utilidades.

export function adminErrorState(error: Error): AdminFormState {
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

export function adminSaveState(result: Result<unknown, Error>): AdminFormState {
  if (!result.success) return adminErrorState(result.error);
  refresh(); // Vuelve a pintar el editor con los datos guardados.
  return { status: "success" };
}

// Las listas llegan como JSON en un campo oculto. Analizarlo solo convierte el texto en datos simples; el
// caso de uso los valida como cualquier otra entrada (pueden ser cualquier cosa). El tamaño máximo evita
// analizar un JSON enorme.
const JSON_FIELD_MAX_LENGTH = 200_000;

export function jsonField(formData: FormData, name: string): unknown {
  const raw = formData.get(name);
  if (typeof raw !== "string" || raw.length > JSON_FIELD_MAX_LENGTH) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
