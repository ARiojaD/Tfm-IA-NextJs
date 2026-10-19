"use server";

import { refresh } from "next/cache";
import { InvalidCommentError } from "@/application/errors/InvalidCommentError";
import type { CommentFormState } from "@/components/topic/CommentForm";
import type { QuizAnswerState } from "@/components/topic/QuizGame";
import { getContainer } from "@/composition/container";

// Server Actions are public POST endpoints: anyone can call them with any payload, not only
// through our UI. They stay thin on purpose: the use cases validate every input (unknown → DTO),
// and these functions only translate the Result into what the components display.
// TODO(OWASP API4): add rate limiting before this is deployed publicly.

export async function answerQuizQuestion(input: unknown): Promise<QuizAnswerState> {
  const result = await getContainer().answerQuizQuestion.execute(input);

  if (!result.success) {
    return { status: "error", message: "No se ha podido comprobar la respuesta. Inténtalo de nuevo." };
  }
  return { status: "answered", ...result.data };
}

export async function addComment(_previous: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const result = await getContainer().addComment.execute({
    topicSlug: formData.get("topicSlug"),
    author: formData.get("author"),
    message: formData.get("message"),
  });

  if (result.success) {
    refresh(); // Re-render the page so the new comment appears at the top of the list.
    return { status: "success" };
  }
  if (result.error instanceof InvalidCommentError) {
    const { author, message } = result.error.fieldErrors;
    return {
      status: "error",
      fieldErrors: { author, message },
      formError: result.error.formErrors[0] ?? (result.error.fieldErrors.topicSlug ? "Tema no válido." : undefined),
    };
  }
  return { status: "error", formError: "Este tema ya no está disponible." };
}
