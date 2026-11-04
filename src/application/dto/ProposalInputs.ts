import { z } from "zod";
import { PROPOSAL_KINDS, PROPOSAL_REVIEW_NOTE_MAX_LENGTH, PROPOSAL_SOURCE_MAX_LENGTH } from "@/domain/entities/Proposal";
import { EntityIdSchema } from "@/domain/value-objects/EntityId";
import { RECOMMENDATION_TYPES } from "@/domain/value-objects/RecommendationType";
import { SlugSchema } from "@/domain/value-objects/Slug";
import { basicsShape, calendarEra, checkPeriodOrder, optionalMonth, toBasics, toDate, year } from "./TopicEditorInputs";

// What a user sends to propose a change. Every schema is strict: the author, the user, the status and
// the dates are decided by the server (session, Clock), never by the form.

const text = (missing: string, max: number, tooLong: string) =>
  z.string({ error: missing }).trim().min(1, { error: missing }).max(max, { error: tooLong });

const source = text(
  "Indica la fuente: un libro, un artículo o una web",
  PROPOSAL_SOURCE_MAX_LENGTH,
  `La fuente no puede superar los ${PROPOSAL_SOURCE_MAX_LENGTH} caracteres`,
);
const topicSlug = SlugSchema;

export const ProposalKindInputSchema = z.object({ kind: z.enum(PROPOSAL_KINDS, { error: "Elige qué quieres proponer" }) });

// One schema per kind; the use case picks it after reading `kind`.
export const SUBMIT_PROPOSAL_SCHEMAS = {
  EVENT: z
    .strictObject({
      kind: z.literal("EVENT"),
      topicSlug,
      title: text("Escribe el título del evento", 120, "El título no puede superar los 120 caracteres"),
      year: year("Escribe el año"),
      era: calendarEra,
      month: optionalMonth,
      description: text("Describe el evento", 1000, "La descripción no puede superar los 1000 caracteres"),
      source,
    })
    .transform(({ year: yearNumber, era, month, title, description, ...rest }) => ({
      ...rest,
      event: { title, date: toDate(yearNumber, era, month), description },
    })),
  RECOMMENDATION: z
    .strictObject({
      kind: z.literal("RECOMMENDATION"),
      topicSlug,
      type: z.enum(RECOMMENDATION_TYPES, { error: "Elige el tipo" }),
      title: text("Escribe el título", 150, "El título no puede superar los 150 caracteres"),
      creator: text("Escribe el autor o director", 120, "El autor no puede superar los 120 caracteres"),
      year: z
        .string({ error: "Escribe el año" })
        .trim()
        .regex(/^\d{1,4}$/, { error: "Escribe el año con números (hasta 4 cifras)" })
        .transform(Number),
      description: text("Explica por qué la recomiendas", 500, "La descripción no puede superar los 500 caracteres"),
      source,
    })
    .transform(({ type, title, creator, year: yearNumber, description, ...rest }) => ({
      ...rest,
      recommendation: { type, title, creator, year: yearNumber, description },
    })),
  CORRECTION: z.strictObject({
    kind: z.literal("CORRECTION"),
    topicSlug,
    message: text("Explica qué hay que corregir", 1000, "La corrección no puede superar los 1000 caracteres"),
    source,
  }),
  NEW_TOPIC: z
    .strictObject({
      kind: z.literal("NEW_TOPIC"),
      ...basicsShape,
      description: text("Describe el tema", 4000, "La descripción no puede superar los 4000 caracteres"),
      source,
    })
    .superRefine((fields, context) => checkPeriodOrder(fields, context))
    .transform(({ kind, description, source: proposalSource, ...basics }) => ({
      kind,
      source: proposalSource,
      newTopic: { ...toBasics(basics), description },
    })),
};

// The admin's decision. Rejecting needs a reason, which the user will read.
export const ReviewProposalInputSchema = z
  .strictObject({
    proposalId: EntityIdSchema,
    decision: z.enum(["approve", "reject"], { error: "Elige aprobar o rechazar" }),
    note: z
      .string({ error: "Nota no válida" })
      .trim()
      .max(PROPOSAL_REVIEW_NOTE_MAX_LENGTH, { error: `La nota no puede superar los ${PROPOSAL_REVIEW_NOTE_MAX_LENGTH} caracteres` }),
  })
  .superRefine(({ decision, note }, context) => {
    if (decision === "reject" && note === "") {
      context.addIssue({ code: "custom", path: ["note"], message: "Explica el motivo del rechazo" });
    }
  });
