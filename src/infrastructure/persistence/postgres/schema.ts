import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
// Relative imports: drizzle-kit loads this file on its own and does not know the "@/" alias.
import type { KeyFact } from "../../../domain/value-objects/KeyFact";
import type { TopicImage } from "../../../domain/value-objects/TopicImage";
import { HISTORICAL_ERAS } from "../../../domain/value-objects/HistoricalEra";
import { RECOMMENDATION_TYPES } from "../../../domain/value-objects/RecommendationType";
import { TOPIC_CATEGORIES } from "../../../domain/value-objects/TopicCategory";

// PostgreSQL tables for the domain entities. The domain (Zod schemas) stays the source of truth: the
// enums reuse its constants, and the CHECK constraints repeat its key rules as a second line of defence,
// so a bad row is rejected even if it is inserted by hand or by a future script.

export const historicalEra = pgEnum("historical_era", HISTORICAL_ERAS);
export const topicCategory = pgEnum("topic_category", TOPIC_CATEGORIES);
export const recommendationType = pgEnum("recommendation_type", RECOMMENDATION_TYPES);

// Historical dates: negative years are BC, year 0 does not exist, the month is optional.
const validYear = (column: AnyPgColumn) => sql`${column} IS NULL OR ${column} <> 0`;
const validMonth = (column: AnyPgColumn) => sql`${column} IS NULL OR ${column} BETWEEN 1 AND 12`;

export const topics = pgTable(
  "topics",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    era: historicalEra("era").notNull(),
    category: topicCategory("category").notNull(),
    summary: text("summary").notNull(),
    // The period in plain columns (not JSON) so the database can sort topics chronologically.
    periodStartYear: integer("period_start_year").notNull(),
    periodStartMonth: smallint("period_start_month"),
    periodEndYear: integer("period_end_year"),
    periodEndMonth: smallint("period_end_month"),
    // Ordered lists that are always read whole with their topic: an array and JSONB are enough.
    introduction: text("introduction").array().notNull(),
    keyFacts: jsonb("key_facts").$type<KeyFact[]>().notNull(),
    image: jsonb("image").$type<TopicImage>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("topics_era_category_idx").on(table.era, table.category),
    check("topics_period_start_year_valid", validYear(table.periodStartYear)),
    check("topics_period_start_month_valid", validMonth(table.periodStartMonth)),
    check("topics_period_end_year_valid", validYear(table.periodEndYear)),
    check("topics_period_end_month_valid", validMonth(table.periodEndMonth)),
    check(
      "topics_period_end_after_start",
      sql`${table.periodEndYear} IS NULL OR ${table.periodEndYear} >= ${table.periodStartYear}`,
    ),
    check("topics_introduction_not_empty", sql`cardinality(${table.introduction}) > 0`),
  ],
);

// Related topics: one row per direction (César → Alesia and Alesia → César), as in the domain.
export const topicRelations = pgTable(
  "topic_relations",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    relatedTopicId: text("related_topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.topicId, table.relatedTopicId] }),
    check("topic_relations_not_self", sql`${table.topicId} <> ${table.relatedTopicId}`),
  ],
);

export const historicalEvents = pgTable(
  "historical_events",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    dateYear: integer("date_year").notNull(),
    dateMonth: smallint("date_month"),
    era: historicalEra("era").notNull(),
    description: text("description").notNull(),
  },
  (table) => [
    index("historical_events_topic_idx").on(table.topicId),
    check("historical_events_year_valid", validYear(table.dateYear)),
    check("historical_events_month_valid", validMonth(table.dateMonth)),
  ],
);

// One quiz per topic; its questions keep their order with `position`.
export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .unique()
    .references(() => topics.id, { onDelete: "cascade" }),
});

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: text("id").primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    question: text("question").notNull(),
    options: text("options").array().notNull(),
    correctOptionIndex: smallint("correct_option_index").notNull(),
    explanation: text("explanation"),
  },
  (table) => [
    unique("quiz_questions_quiz_position_unique").on(table.quizId, table.position),
    check("quiz_questions_two_options", sql`cardinality(${table.options}) >= 2`),
    check(
      "quiz_questions_correct_option_valid",
      sql`${table.correctOptionIndex} >= 0 AND ${table.correctOptionIndex} < cardinality(${table.options})`,
    ),
  ],
);

// Anonymous for now: phase 2 (login) adds a user_id column and the author comes from the session.
export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("comments_topic_created_idx").on(table.topicId, table.createdAt.desc())],
);

export const recommendations = pgTable(
  "recommendations",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    type: recommendationType("type").notNull(),
    title: text("title").notNull(),
    creator: text("creator").notNull(),
    year: integer("year").notNull(),
    description: text("description").notNull(),
  },
  (table) => [index("recommendations_topic_idx").on(table.topicId)],
);
