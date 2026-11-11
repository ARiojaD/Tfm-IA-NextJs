"use server";

import { refresh } from "next/cache";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidCommentError } from "@/application/errors/InvalidCommentError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { CommentFormState } from "@/components/topic/CommentForm";
import type { QuizAnswerState } from "@/components/topic/QuizGame";
import { getContainer } from "@/composition/container";
import { currentRequesterId } from "@/lib/currentRequesterId";

// Las Server Actions son endpoints POST públicos: cualquiera puede llamarlas con cualquier contenido, no
// solo desde nuestra interfaz. Son finas a propósito: los casos de uso validan toda entrada (de `unknown`
// a DTO) y aplican los límites de peticiones; estas funciones solo identifican a quien llama y traducen el
// `Result` a lo que muestran los componentes.

function rateLimitMessage(error: RateLimitExceededError, action: string): string {
  return `Has ${action} demasiadas veces seguidas. Espera ${error.retryAfterSeconds} s y vuelve a intentarlo.`;
}

export async function answerQuizQuestion(input: unknown): Promise<QuizAnswerState> {
  const result = await getContainer().answerQuizQuestion.execute(input, await currentRequesterId());

  if (result.success) {
    return { status: "answered", ...result.data };
  }
  if (result.error instanceof RateLimitExceededError) {
    return { status: "error", message: rateLimitMessage(result.error, "respondido") };
  }
  return { status: "error", message: "No se ha podido comprobar la respuesta. Inténtalo de nuevo." };
}

// El autor nunca se lee del formulario: el caso de uso lo toma de la sesión.
export async function addComment(_previous: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const result = await getContainer().addComment.execute({
    topicSlug: formData.get("topicSlug"),
    message: formData.get("message"),
  });

  if (result.success) {
    refresh(); // Vuelve a pintar la página para que el comentario nuevo salga el primero de la lista.
    return { status: "success" };
  }
  if (result.error instanceof AuthenticationRequiredError) {
    return { status: "error", formError: "Tu sesión ha terminado. Inicia sesión de nuevo para comentar." };
  }
  if (result.error instanceof RateLimitExceededError) {
    return { status: "error", formError: rateLimitMessage(result.error, "comentado") };
  }
  if (result.error instanceof InvalidCommentError) {
    return {
      status: "error",
      fieldErrors: { message: result.error.fieldErrors.message },
      formError: result.error.formErrors[0] ?? (result.error.fieldErrors.topicSlug ? "Tema no válido." : undefined),
    };
  }
  return { status: "error", formError: "Este tema ya no está disponible." };
}
