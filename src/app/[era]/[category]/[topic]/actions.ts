"use server";

import { refresh } from "next/cache";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidCommentError } from "@/application/errors/InvalidCommentError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { CommentFormState } from "@/components/topic/CommentForm";
import type { QuizAnswerState } from "@/components/topic/QuizGame";
import { getContainer } from "@/composition/container";
import { currentRequesterId } from "@/lib/currentRequesterId";

// Server Actions are public POST endpoints: anyone can call them with any payload, not only
// through our UI. They stay thin on purpose: the use cases validate every input (unknown → DTO)
// and enforce the rate limits; these functions only identify the caller and translate the
// Result into what the components display.

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

// The author is never read from the form: the use case takes it from the session.
export async function addComment(_previous: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const result = await getContainer().addComment.execute({
    topicSlug: formData.get("topicSlug"),
    message: formData.get("message"),
  });

  if (result.success) {
    refresh(); // Re-render the page so the new comment appears at the top of the list.
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
