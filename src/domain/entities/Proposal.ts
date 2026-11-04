import { z } from "zod";
import { DisplayNameSchema } from "../value-objects/DisplayName";
import { EntityIdSchema } from "../value-objects/EntityId";
import { HistoricalDateSchema } from "../value-objects/HistoricalDate";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { HistoricalPeriodSchema } from "../value-objects/HistoricalPeriod";
import { RecommendationTypeSchema } from "../value-objects/RecommendationType";
import { TopicCategorySchema } from "../value-objects/TopicCategory";

// A user's contribution to the encyclopedia, reviewed by an admin before anything changes: an event or a
// recommendation for a topic, a correction of a topic, or a new topic. Text only (never files), and
// always with its source, so the admin can check it.
export const PROPOSAL_KINDS = ["EVENT", "RECOMMENDATION", "CORRECTION", "NEW_TOPIC"] as const;
export const PROPOSAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export const PROPOSAL_SOURCE_MAX_LENGTH = 300;
export const PROPOSAL_REVIEW_NOTE_MAX_LENGTH = 300;

const text = (max: number) => z.string().trim().min(1).max(max);

const common = {
  id: EntityIdSchema,
  userId: EntityIdSchema,
  // The author's display name when they proposed it (like a comment's signature).
  authorName: DisplayNameSchema,
  source: text(PROPOSAL_SOURCE_MAX_LENGTH),
  status: z.enum(PROPOSAL_STATUSES),
  // The admin's answer: required to reject, optional to approve.
  reviewNote: text(PROPOSAL_REVIEW_NOTE_MAX_LENGTH).optional(),
  createdAt: z.date(),
  reviewedAt: z.date().optional(),
  // Optional: the reviewer's account may be deleted later.
  reviewedBy: EntityIdSchema.optional(),
};

// The topic it is about, with its title when it was proposed (the list shows it even if it changes).
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
