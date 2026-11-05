import { type Comment, CommentSchema } from "@/domain/entities/Comment";
import { type HistoricalEvent, HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { type HistoricalTopic, HistoricalTopicSchema } from "@/domain/entities/HistoricalTopic";
import { type KnowledgeChunk, KnowledgeChunkSchema } from "@/domain/entities/KnowledgeChunk";
import { type Proposal, ProposalSchema } from "@/domain/entities/Proposal";
import { type Quiz, QuizSchema } from "@/domain/entities/Quiz";
import { type Recommendation, RecommendationSchema } from "@/domain/entities/Recommendation";
import { type EntityId, EntityIdSchema } from "@/domain/value-objects/EntityId";
import type { HistoricalDate } from "@/domain/value-objects/HistoricalDate";
import { type HistoricalEra, HistoricalEraSchema } from "@/domain/value-objects/HistoricalEra";
import type {
  comments,
  eraFollows,
  historicalEvents,
  knowledgeChunks,
  proposals,
  quizQuestions,
  quizzes,
  recommendations,
  savedTopics,
  topics,
} from "./schema";

// Translation between table rows and domain entities. Rows read from the database are parsed with the
// domain schemas: if the data ever drifts from the domain rules, the error shows up here, at the border,
// and never reaches the use cases. Parsing also returns fresh objects, so callers never share references.

type TopicRow = typeof topics.$inferSelect;
type EventRow = typeof historicalEvents.$inferSelect;
type QuizRow = typeof quizzes.$inferSelect;
type QuizQuestionRow = typeof quizQuestions.$inferSelect;
type CommentRow = typeof comments.$inferSelect;
type RecommendationRow = typeof recommendations.$inferSelect;
type EraFollowRow = typeof eraFollows.$inferSelect;
type SavedTopicRow = typeof savedTopics.$inferSelect;
type KnowledgeChunkRow = typeof knowledgeChunks.$inferSelect;

// SQL NULL becomes a missing property, as optional fields are absent (not null) in the domain.
function toDate(year: number, month: number | null): HistoricalDate {
  return month === null ? { year } : { year, month };
}

export function toTopic(row: TopicRow, relatedTopicIds: string[]): HistoricalTopic {
  return HistoricalTopicSchema.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    era: row.era,
    category: row.category,
    summary: row.summary,
    period: {
      start: toDate(row.periodStartYear, row.periodStartMonth),
      ...(row.periodEndYear !== null && { end: toDate(row.periodEndYear, row.periodEndMonth) }),
    },
    introduction: row.introduction,
    keyFacts: row.keyFacts,
    ...(row.image !== null && { image: row.image }),
    relatedTopicIds,
    status: row.status,
  });
}

export function toTopicRow(topic: HistoricalTopic): typeof topics.$inferInsert {
  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    era: topic.era,
    category: topic.category,
    summary: topic.summary,
    periodStartYear: topic.period.start.year,
    periodStartMonth: topic.period.start.month ?? null,
    periodEndYear: topic.period.end?.year ?? null,
    periodEndMonth: topic.period.end?.month ?? null,
    introduction: topic.introduction,
    keyFacts: topic.keyFacts,
    image: topic.image ?? null,
    status: topic.status,
  };
}

export function toEvent(row: EventRow): HistoricalEvent {
  return HistoricalEventSchema.parse({
    id: row.id,
    topicId: row.topicId,
    title: row.title,
    date: toDate(row.dateYear, row.dateMonth),
    era: row.era,
    description: row.description,
  });
}

export function toEventRow(event: HistoricalEvent): typeof historicalEvents.$inferInsert {
  return {
    id: event.id,
    topicId: event.topicId,
    title: event.title,
    dateYear: event.date.year,
    dateMonth: event.date.month ?? null,
    era: event.era,
    description: event.description,
  };
}

// Questions must arrive sorted by position.
export function toQuiz(row: QuizRow, questionRows: QuizQuestionRow[]): Quiz {
  return QuizSchema.parse({
    id: row.id,
    topicId: row.topicId,
    questions: questionRows.map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
      ...(question.explanation !== null && { explanation: question.explanation }),
    })),
  });
}

export function toQuizRows(quiz: Quiz) {
  return {
    quiz: { id: quiz.id, topicId: quiz.topicId } satisfies typeof quizzes.$inferInsert,
    questions: quiz.questions.map(
      (question, position): typeof quizQuestions.$inferInsert => ({
        id: question.id,
        quizId: quiz.id,
        position,
        question: question.question,
        options: question.options,
        correctOptionIndex: question.correctOptionIndex,
        explanation: question.explanation ?? null,
      }),
    ),
  };
}

export function toComment(row: CommentRow): Comment {
  return CommentSchema.parse({
    id: row.id,
    topicId: row.topicId,
    ...(row.userId !== null && { userId: row.userId }),
    author: row.author,
    message: row.message,
    createdAt: row.createdAt,
  });
}

export function toCommentRow(comment: Comment): typeof comments.$inferInsert {
  return { ...comment, userId: comment.userId ?? null };
}

export function toFollowedEra(row: Pick<EraFollowRow, "era">): HistoricalEra {
  return HistoricalEraSchema.parse(row.era);
}

export function toSavedTopicId(row: Pick<SavedTopicRow, "topicId">): EntityId {
  return EntityIdSchema.parse(row.topicId);
}

export function toRecommendation(row: RecommendationRow): Recommendation {
  return RecommendationSchema.parse({ ...row });
}

export function toRecommendationRow(recommendation: Recommendation): typeof recommendations.$inferInsert {
  return { ...recommendation };
}

type ProposalRow = typeof proposals.$inferSelect;

// What each kind proposes, kept in `payload`; the common fields are columns.
function proposalPayload(proposal: Proposal): Record<string, unknown> {
  switch (proposal.kind) {
    case "EVENT":
      return { event: proposal.event };
    case "RECOMMENDATION":
      return { recommendation: proposal.recommendation };
    case "CORRECTION":
      return { message: proposal.message };
    case "NEW_TOPIC":
      return { newTopic: proposal.newTopic };
  }
}

export function toProposal(row: ProposalRow): Proposal {
  return ProposalSchema.parse({
    id: row.id,
    userId: row.userId,
    authorName: row.authorName,
    kind: row.kind,
    ...(row.topicId !== null && { topicId: row.topicId }),
    ...(row.topicTitle !== null && { topicTitle: row.topicTitle }),
    ...row.payload,
    source: row.source,
    status: row.status,
    ...(row.reviewNote !== null && { reviewNote: row.reviewNote }),
    createdAt: row.createdAt,
    ...(row.reviewedAt !== null && { reviewedAt: row.reviewedAt }),
    ...(row.reviewedBy !== null && { reviewedBy: row.reviewedBy }),
  });
}

export function toProposalRow(proposal: Proposal): typeof proposals.$inferInsert {
  return {
    id: proposal.id,
    userId: proposal.userId,
    authorName: proposal.authorName,
    kind: proposal.kind,
    topicId: proposal.kind === "NEW_TOPIC" ? null : proposal.topicId,
    topicTitle: proposal.kind === "NEW_TOPIC" ? null : proposal.topicTitle,
    payload: proposalPayload(proposal),
    source: proposal.source,
    status: proposal.status,
    reviewNote: proposal.reviewNote ?? null,
    createdAt: proposal.createdAt,
    reviewedAt: proposal.reviewedAt ?? null,
    reviewedBy: proposal.reviewedBy ?? null,
  };
}

export function toKnowledgeChunk(row: Omit<KnowledgeChunkRow, "embedding">): KnowledgeChunk {
  return KnowledgeChunkSchema.parse({
    topicId: row.topicId,
    source: row.source,
    position: row.position,
    ...(row.eventId !== null && { eventId: row.eventId }),
    content: row.content,
  });
}

export function toKnowledgeChunkRow(chunk: KnowledgeChunk, embedding: number[]): typeof knowledgeChunks.$inferInsert {
  return {
    topicId: chunk.topicId,
    source: chunk.source,
    position: chunk.position,
    eventId: chunk.eventId ?? null,
    content: chunk.content,
    embedding,
  };
}
