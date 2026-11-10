import { z } from "zod";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { compareHistoricalDates, type HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import type { HistoricalPeriod } from "@/domain/value-objects/HistoricalPeriod";
import { RECOMMENDATION_TYPES } from "@/domain/value-objects/RecommendationType";
import { TOPIC_CATEGORIES } from "@/domain/value-objects/TopicCategory";
import { TopicStatusSchema } from "@/domain/value-objects/TopicStatus";

// What the admin editor's forms send. Every value of a form is a string, so years and months arrive as
// text and are turned into numbers here; dates BC become negative years, as the domain expects. All the
// schemas are strict: id, slug and status are never taken from a form that edits the content. The field
// schemas are exported for the other forms that ask for the same data (the users' proposals).

export const TOPIC_TITLE_MAX_LENGTH = 120;
export const TOPIC_SUMMARY_MAX_LENGTH = 300;
export const TOPIC_INTRODUCTION_MAX_LENGTH = 20_000;
export const KEY_FACTS_MAX = 20;

const topicId = EntityIdSchema;

export const year = (missing: string) =>
  z
    .string({ error: missing })
    .trim()
    .min(1, { error: missing })
    .regex(/^\d{1,4}$/, { error: "Escribe el año con números (hasta 4 cifras)" })
    .transform(Number)
    .refine((value) => value !== 0, { error: "El año 0 no existe: al 1 a.C. le sigue el 1 d.C." });

const optionalYear = z
  .string({ error: "Año no válido" })
  .trim()
  .refine((value) => value === "" || /^\d{1,4}$/.test(value), { error: "Escribe el año con números (hasta 4 cifras)" })
  .transform((value) => (value === "" ? undefined : Number(value)))
  .refine((value) => value !== 0, { error: "El año 0 no existe: al 1 a.C. le sigue el 1 d.C." });

export const optionalMonth = z
  .string({ error: "Mes no válido" })
  .trim()
  .refine((value) => value === "" || /^(?:[1-9]|1[0-2])$/.test(value), { error: "Elige un mes del 1 al 12" })
  .transform((value) => (value === "" ? undefined : Number(value)));

export const calendarEra = z.enum(["BC", "AD"], { error: "Elige a.C. o d.C." });

export const basicsShape = {
  title: z
    .string({ error: "Escribe el título" })
    .trim()
    .min(1, { error: "Escribe el título" })
    .max(TOPIC_TITLE_MAX_LENGTH, { error: `El título no puede superar los ${TOPIC_TITLE_MAX_LENGTH} caracteres` }),
  era: z.enum(HISTORICAL_ERAS, { error: "Elige una civilización" }),
  category: z.enum(TOPIC_CATEGORIES, { error: "Elige una categoría" }),
  summary: z
    .string({ error: "Escribe un resumen" })
    .trim()
    .min(1, { error: "Escribe un resumen" })
    .max(TOPIC_SUMMARY_MAX_LENGTH, { error: `El resumen no puede superar los ${TOPIC_SUMMARY_MAX_LENGTH} caracteres` }),
  startYear: year("Escribe el año de inicio"),
  startEra: calendarEra,
  startMonth: optionalMonth,
  endYear: optionalYear,
  endEra: calendarEra,
  endMonth: optionalMonth,
};

export type BasicsFields = z.output<z.ZodObject<typeof basicsShape>>;

export function toDate(yearNumber: number, era: "BC" | "AD", month: number | undefined): HistoricalDate {
  return { year: era === "BC" ? -yearNumber : yearNumber, ...(month !== undefined && { month }) };
}

function toPeriod(fields: BasicsFields): HistoricalPeriod {
  const start = toDate(fields.startYear, fields.startEra, fields.startMonth);
  return fields.endYear === undefined
    ? { start }
    : { start, end: toDate(fields.endYear, fields.endEra, fields.endMonth) };
}

export function checkPeriodOrder(fields: BasicsFields, context: z.RefinementCtx) {
  const { start, end } = toPeriod(fields);
  if (end && compareHistoricalDates(start, end) > 0) {
    context.addIssue({ code: "custom", path: ["endYear"], message: "El fin no puede ser anterior al inicio" });
  }
}

export function toBasics({ title, era, category, summary, ...dates }: BasicsFields) {
  return { title, era, category, summary, period: toPeriod({ title, era, category, summary, ...dates }) };
}

export const CreateTopicInputSchema = z
  .strictObject(basicsShape, { error: "Los datos del tema no son válidos" })
  .superRefine(checkPeriodOrder)
  .transform(toBasics);

export const UpdateTopicBasicsInputSchema = z
  .strictObject({ topicId, ...basicsShape }, { error: "Los datos del tema no son válidos" })
  .superRefine(checkPeriodOrder)
  .transform(({ topicId: id, ...fields }) => ({ topicId: id, basics: toBasics(fields) }));

// Paragraphs are separated by blank lines. Browsers send textarea line breaks as \r\n.
export const UpdateTopicIntroductionInputSchema = z.strictObject({
  topicId,
  introduction: z
    .string({ error: "Escribe la introducción" })
    .max(TOPIC_INTRODUCTION_MAX_LENGTH, { error: "La introducción no puede superar los 20 000 caracteres" })
    .transform((text) =>
      text
        .replace(/\r\n?/g, "\n")
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0),
    ),
});

const keyFactRow = z.strictObject({
  label: z
    .string({ error: "escribe la etiqueta" })
    .trim()
    .min(1, { error: "escribe la etiqueta" })
    .max(40, { error: "la etiqueta no puede superar los 40 caracteres" }),
  value: z
    .string({ error: "escribe el valor" })
    .trim()
    .min(1, { error: "escribe el valor" })
    .max(200, { error: "el valor no puede superar los 200 caracteres" }),
});

const isBlankRow = (row: unknown) =>
  typeof row === "object" &&
  row !== null &&
  Object.values(row).every((value) => typeof value === "string" && value.trim() === "");

// Rows left completely empty in the form are dropped; the rest keep their order.
export const UpdateTopicKeyFactsInputSchema = z.strictObject({
  topicId,
  keyFacts: z.preprocess(
    (rows) => (Array.isArray(rows) ? rows.filter((row) => !isBlankRow(row)) : rows),
    z.array(keyFactRow).max(KEY_FACTS_MAX, { error: `Como máximo ${KEY_FACTS_MAX} datos clave` }),
  ),
});

export const ChangeTopicStatusInputSchema = z.strictObject({ topicId, status: TopicStatusSchema });

export const DeleteTopicInputSchema = z.strictObject({ topicId });

// Asking the AI for a proposal: only the topic, whose saved text is what the model reads.
export const DraftTopicInputSchema = z.strictObject({ topicId });

// --- The topic's lists: timeline, quiz, recommendations and related topics ---
// The editor sends each list whole (as JSON in a hidden field). `id` is the row's id when it already
// existed: the use case keeps it only if it belongs to this topic, so nobody can overwrite another
// topic's rows by sending their ids.

export const EVENTS_MAX = 50;
export const QUIZ_QUESTIONS_MAX = 10;
export const QUIZ_OPTIONS_MIN = 2;
export const QUIZ_OPTIONS_MAX = 4;
export const RECOMMENDATIONS_MAX = 20;
export const RELATED_TOPICS_MAX = 10;

const rowId = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);

const text = (missing: string, max: number, tooLong: string) =>
  z.string({ error: missing }).trim().min(1, { error: missing }).max(max, { error: tooLong });

const eventRow = z
  .strictObject({
    id: rowId,
    title: text("escribe el título", 120, "el título no puede superar los 120 caracteres"),
    year: year("escribe el año"),
    era: calendarEra,
    month: optionalMonth,
    description: text("escribe la descripción", 1000, "la descripción no puede superar los 1000 caracteres"),
  })
  .transform(({ id, title, year: yearNumber, era, month, description }) => ({
    id,
    title,
    date: toDate(yearNumber, era, month),
    description,
  }));

export const UpdateTopicEventsInputSchema = z.strictObject({
  topicId,
  events: z.array(eventRow, { error: "La lista de eventos no es válida" }).max(EVENTS_MAX, { error: `Como máximo ${EVENTS_MAX} eventos` }),
});

const questionRow = z.strictObject({
  id: rowId,
  question: text("escribe la pregunta", 300, "la pregunta no puede superar los 300 caracteres"),
  options: z
    .array(text("escribe todas las opciones", 150, "cada opción puede tener hasta 150 caracteres"))
    .min(QUIZ_OPTIONS_MIN, { error: `pon al menos ${QUIZ_OPTIONS_MIN} opciones` })
    .max(QUIZ_OPTIONS_MAX, { error: `como máximo ${QUIZ_OPTIONS_MAX} opciones` }),
  correctOptionIndex: z.number({ error: "marca la respuesta correcta" }).int().min(0, { error: "marca la respuesta correcta" }),
  explanation: z
    .string()
    .trim()
    .max(500, { error: "la explicación no puede superar los 500 caracteres" })
    .transform((value) => value || undefined),
});

// No questions at all removes the topic's quiz.
export const UpdateTopicQuizInputSchema = z.strictObject({
  topicId,
  questions: z.array(questionRow, { error: "La lista de preguntas no es válida" }).max(QUIZ_QUESTIONS_MAX, { error: `Como máximo ${QUIZ_QUESTIONS_MAX} preguntas` }),
});

const recommendationRow = z.strictObject({
  id: rowId,
  type: z.enum(RECOMMENDATION_TYPES, { error: "elige el tipo" }),
  title: text("escribe el título", 150, "el título no puede superar los 150 caracteres"),
  creator: text("escribe el autor o director", 120, "el autor no puede superar los 120 caracteres"),
  // The year of the work (a book, a film): modern years, written as is.
  year: z
    .string({ error: "escribe el año" })
    .trim()
    .regex(/^\d{1,4}$/, { error: "escribe el año con números (hasta 4 cifras)" })
    .transform(Number),
  description: text("escribe por qué la recomiendas", 500, "la descripción no puede superar los 500 caracteres"),
});

export const UpdateTopicRecommendationsInputSchema = z.strictObject({
  topicId,
  recommendations: z
    .array(recommendationRow, { error: "La lista de recomendaciones no es válida" })
    .max(RECOMMENDATIONS_MAX, { error: `Como máximo ${RECOMMENDATIONS_MAX} recomendaciones` }),
});

export const UpdateRelatedTopicsInputSchema = z.strictObject({
  topicId,
  relatedTopicIds: z
    .array(EntityIdSchema, { error: "La lista de temas no es válida" })
    .max(RELATED_TOPICS_MAX, { error: `Como máximo ${RELATED_TOPICS_MAX} temas relacionados` })
    .refine((ids) => new Set(ids).size === ids.length, { error: "Un tema no puede estar repetido" }),
});

// --- The topic's image ---
// Only a catalog id: the file, its size and its credit come from the catalog, never from the form. An
// empty id leaves the topic without image (nothing is shown on its page).
export const UpdateTopicImageInputSchema = z
  .strictObject({
    topicId,
    imageId: z.string({ error: "Elige una imagen" }).trim().max(100, { error: "Elige una imagen del catálogo" }),
    alt: z.string({ error: "Describe la imagen" }).trim().max(200, { error: "El texto alternativo no puede superar los 200 caracteres" }),
    caption: z.string({ error: "Escribe un pie de foto" }).trim().max(100, { error: "El pie no puede superar los 100 caracteres" }),
  })
  .superRefine(({ imageId, alt, caption }, context) => {
    if (imageId === "") return;
    if (alt === "") context.addIssue({ code: "custom", path: ["alt"], message: "Describe la imagen para quien no puede verla" });
    if (caption === "") context.addIssue({ code: "custom", path: ["caption"], message: "Escribe un pie de foto" });
  });
