"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { AdminRequiredError } from "@/application/errors/AdminRequiredError";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { InvalidTopicError } from "@/application/errors/InvalidTopicError";
import { RateLimitExceededError } from "@/application/errors/RateLimitExceededError";
import { TopicDraftError } from "@/application/errors/TopicDraftError";
import { TopicIsPublishedError } from "@/application/errors/TopicIsPublishedError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AdminFormState } from "@/components/admin/adminFormState";
import type { AiDraftResult } from "@/components/admin/AiDraftButton";
import { getContainer } from "@/composition/container";
import type { EventDraftRow, QuestionDraftRow } from "@/domain/entities/TopicDrafts";
import type { Result } from "@/shared/Result";

// Server Actions finas para el editor de temas. Como toda Server Action, son endpoints POST públicos: los
// casos de uso comprueban el rol ADMIN, limitan y validan; estas solo leen el formulario y traducen el
// `Result` a lo que muestra el formulario, sin detalles internos.

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
  refresh(); // Vuelve a pintar el editor (y su estado) con los datos guardados.
  return { status: "success" };
}

// Un tema nuevo va directo a su editor, para escribir la introducción y el resto.
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

// Las etiquetas y los valores llegan como dos listas en el mismo orden: la etiqueta n va con el valor n.
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

// Las listas (cronología, quiz, recomendaciones y temas relacionados) llegan como JSON en un campo oculto.
// Analizarlo solo convierte el texto en datos simples; el caso de uso los valida como cualquier otra
// entrada (pueden ser cualquier cosa). El tamaño máximo evita analizar un JSON enorme.
const JSON_FIELD_MAX_LENGTH = 200_000;

function jsonField(formData: FormData, name: string): unknown {
  const raw = formData.get(name);
  if (typeof raw !== "string" || raw.length > JSON_FIELD_MAX_LENGTH) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function draftResult<Row>(result: Result<Row[], Error>): AiDraftResult<Row> {
  if (result.success) return { status: "success", rows: result.data };
  const { error } = result;
  if (error instanceof TopicDraftError) return { status: "error", message: error.message };
  if (error instanceof RateLimitExceededError) {
    return { status: "error", message: `Has pedido muchas propuestas seguidas. Espera ${Math.ceil(error.retryAfterSeconds / 60)} min y vuelve a intentarlo.` };
  }
  return { status: "error", message: errorState(error).formErrors?.[0] ?? "No se ha podido pedir la propuesta." };
}

// Las propuestas de la IA solo devuelven filas para el formulario: no se guarda nada hasta que lo guarde el
// administrador.
export async function draftTopicEvents(topicId: string): Promise<AiDraftResult<EventDraftRow>> {
  return draftResult(await getContainer().draftTopicEvents.execute({ topicId }));
}

export async function draftTopicQuiz(topicId: string): Promise<AiDraftResult<QuestionDraftRow>> {
  return draftResult(await getContainer().draftTopicQuiz.execute({ topicId }));
}

export async function updateTopicEvents(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateTopicEvents.execute({ topicId: formData.get("topicId"), events: jsonField(formData, "events") }),
  );
}

export async function updateTopicQuiz(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateTopicQuiz.execute({ topicId: formData.get("topicId"), questions: jsonField(formData, "questions") }),
  );
}

export async function updateTopicRecommendations(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateTopicRecommendations.execute({
      topicId: formData.get("topicId"),
      recommendations: jsonField(formData, "recommendations"),
    }),
  );
}

export async function updateRelatedTopics(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateRelatedTopics.execute({
      topicId: formData.get("topicId"),
      relatedTopicIds: jsonField(formData, "relatedTopicIds"),
    }),
  );
}

export async function updateTopicImage(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return toState(
    await getContainer().updateTopicImage.execute({
      topicId: formData.get("topicId"),
      imageId: formData.get("imageId"),
      alt: formData.get("alt"),
      caption: formData.get("caption"),
    }),
  );
}

// Se puede publicar sin imagen (la página simplemente no muestra ninguna); solo se avisa al
// administrador, para que sea una decisión y no un descuido.
export async function changeTopicStatus(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const result = await getContainer().changeTopicStatus.execute({
    topicId: formData.get("topicId"),
    status: formData.get("status"),
  });
  const state = toState(result);
  if (result.success && result.data.status === "PUBLISHED" && !result.data.image) {
    return { ...state, notices: ["Publicado sin imagen. Puedes elegir una más adelante."] };
  }
  return state;
}

export async function deleteTopic(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const result = await getContainer().deleteTopic.execute({ topicId: formData.get("topicId") });
  if (!result.success) return errorState(result.error);
  redirect("/admin");
}
