"use server";

import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidQuestionError } from "@/application/errors/InvalidQuestionError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import type { AskFormState } from "@/components/ask/AskForm";
import { getContainer } from "@/composition/container";

// The question is not stored anywhere: it is only sent back so the form keeps showing it.
export async function askEncyclopedia(_previous: AskFormState, formData: FormData): Promise<AskFormState> {
  const rawQuestion = formData.get("question");
  const question = typeof rawQuestion === "string" ? rawQuestion : "";
  const result = await getContainer().askEncyclopedia.execute({ question: rawQuestion });

  if (result.success) {
    return { question, answer: result.data };
  }
  if (result.error instanceof AuthenticationRequiredError) {
    return { question, formError: "Tu sesión ha terminado. Inicia sesión de nuevo para preguntar." };
  }
  if (result.error instanceof RateLimitExceededError) {
    const minutes = Math.ceil(result.error.retryAfterSeconds / 60);
    return { question, formError: `Has hecho muchas preguntas seguidas. Espera ${minutes} min y vuelve a intentarlo.` };
  }
  if (result.error instanceof InvalidQuestionError) {
    return { question, fieldError: result.error.fieldErrors.question?.[0] ?? "Escribe tu pregunta" };
  }
  return { question, formError: result.error.message };
}
