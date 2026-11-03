import { z } from "zod";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { compareHistoricalDates, type HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import type { HistoricalPeriod } from "@/domain/value-objects/HistoricalPeriod";
import { TOPIC_CATEGORIES } from "@/domain/value-objects/TopicCategory";
import { TopicStatusSchema } from "@/domain/value-objects/TopicStatus";

// What the admin editor's forms send. Every value of a form is a string, so years and months arrive as
// text and are turned into numbers here; dates BC become negative years, as the domain expects. All the
// schemas are strict: id, slug and status are never taken from a form that edits the content.

export const TOPIC_TITLE_MAX_LENGTH = 120;
export const TOPIC_SUMMARY_MAX_LENGTH = 300;
export const TOPIC_INTRODUCTION_MAX_LENGTH = 20_000;
export const KEY_FACTS_MAX = 20;

const topicId = EntityIdSchema;

const year = (missing: string) =>
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

const optionalMonth = z
  .string({ error: "Mes no válido" })
  .trim()
  .refine((value) => value === "" || /^(?:[1-9]|1[0-2])$/.test(value), { error: "Elige un mes del 1 al 12" })
  .transform((value) => (value === "" ? undefined : Number(value)));

const calendarEra = z.enum(["BC", "AD"], { error: "Elige a.C. o d.C." });

const basicsShape = {
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

type BasicsFields = z.output<z.ZodObject<typeof basicsShape>>;

function toDate(yearNumber: number, era: "BC" | "AD", month: number | undefined): HistoricalDate {
  return { year: era === "BC" ? -yearNumber : yearNumber, ...(month !== undefined && { month }) };
}

function toPeriod(fields: BasicsFields): HistoricalPeriod {
  const start = toDate(fields.startYear, fields.startEra, fields.startMonth);
  return fields.endYear === undefined
    ? { start }
    : { start, end: toDate(fields.endYear, fields.endEra, fields.endMonth) };
}

function checkPeriodOrder(fields: BasicsFields, context: z.RefinementCtx) {
  const { start, end } = toPeriod(fields);
  if (end && compareHistoricalDates(start, end) > 0) {
    context.addIssue({ code: "custom", path: ["endYear"], message: "El fin no puede ser anterior al inicio" });
  }
}

function toBasics({ title, era, category, summary, ...dates }: BasicsFields) {
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
