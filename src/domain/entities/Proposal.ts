import { z } from "zod";
import { DisplayNameSchema } from "../value-objects/DisplayName";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalDateSchema } from "../value-objects/HistoricalDate";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { HistoricalPeriodSchema } from "../value-objects/HistoricalPeriod";
import { RecommendationTypeSchema } from "../value-objects/RecommendationType";
import { TopicCategorySchema } from "../value-objects/TopicCategory";

// Una contribución de un usuario a la enciclopedia, que un administrador revisa antes de que cambie nada:
// un evento o una recomendación para un tema, una corrección de un tema o un tema nuevo. Solo texto (nunca
// archivos) y siempre con su fuente, para que el administrador pueda comprobarla.
export const PROPOSAL_KINDS = ["EVENT", "RECOMMENDATION", "CORRECTION", "NEW_TOPIC"] as const;
export const PROPOSAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export const PROPOSAL_SOURCE_MAX_LENGTH = 300;
export const PROPOSAL_REVIEW_NOTE_MAX_LENGTH = 300;

const text = (max: number) => z.string().trim().min(1).max(max);

const common = {
  id: EntityIdSchema,
  userId: EntityIdSchema,
  // El nombre público del autor cuando la hizo (como la firma de un comentario).
  authorName: DisplayNameSchema,
  source: text(PROPOSAL_SOURCE_MAX_LENGTH),
  status: z.enum(PROPOSAL_STATUSES),
  // La respuesta del administrador: obligatoria para rechazar, opcional para aprobar.
  reviewNote: text(PROPOSAL_REVIEW_NOTE_MAX_LENGTH).optional(),
  createdAt: z.date(),
  reviewedAt: z.date().optional(),
  // Opcional: la cuenta del revisor puede borrarse más adelante.
  reviewedBy: EntityIdSchema.optional(),
};

// El tema al que se refiere, con el título que tenía al proponerse (la lista lo muestra aunque cambie).
const aboutTopic = { topicId: EntityIdSchema, topicTitle: text(120) };

export const ProposalSchema = z
  .discriminatedUnion("kind", [
    z.strictObject({
      ...common,
      ...aboutTopic,
      kind: z.literal("EVENT"),
      event: z.strictObject({ title: text(120), date: HistoricalDateSchema, description: text(1000) }),
    }),
    z.strictObject({
      ...common,
      ...aboutTopic,
      kind: z.literal("RECOMMENDATION"),
      recommendation: z.strictObject({
        type: RecommendationTypeSchema,
        title: text(150),
        creator: text(120),
        year: z.number().int(),
        description: text(500),
      }),
    }),
    z.strictObject({ ...common, ...aboutTopic, kind: z.literal("CORRECTION"), message: text(1000) }),
    z.strictObject({
      ...common,
      kind: z.literal("NEW_TOPIC"),
      newTopic: z.strictObject({
        title: text(120),
        era: HistoricalEraSchema,
        category: TopicCategorySchema,
        summary: text(300),
        period: HistoricalPeriodSchema,
        description: text(4000),
      }),
    }),
  ])
  .refine(({ status, reviewNote }) => status !== "REJECTED" || reviewNote !== undefined, {
    message: "Una propuesta rechazada necesita el motivo",
    path: ["reviewNote"],
  })
  .refine(({ status, reviewedAt }) => status === "PENDING" || reviewedAt !== undefined, {
    message: "Una propuesta revisada guarda cuándo se revisó",
    path: ["reviewedAt"],
  });

export type Proposal = z.infer<typeof ProposalSchema>;
export type ProposalKind = (typeof PROPOSAL_KINDS)[number];
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];
