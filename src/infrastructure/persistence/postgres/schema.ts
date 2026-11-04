import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
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
import { PROPOSAL_KINDS, PROPOSAL_STATUSES } from "../../../domain/entities/Proposal";
import type { KeyFact } from "../../../domain/value-objects/KeyFact";
import type { TopicImage } from "../../../domain/value-objects/TopicImage";
import { HISTORICAL_ERAS } from "../../../domain/value-objects/HistoricalEra";
import { RECOMMENDATION_TYPES } from "../../../domain/value-objects/RecommendationType";
import { TOPIC_CATEGORIES } from "../../../domain/value-objects/TopicCategory";
import { TOPIC_STATUSES } from "../../../domain/value-objects/TopicStatus";
import { USER_ROLES } from "../../../domain/value-objects/UserRole";

// PostgreSQL tables for the domain entities. The domain (Zod schemas) stays the source of truth: the
// enums reuse its constants, and the CHECK constraints repeat its key rules as a second line of defence,
// so a bad row is rejected even if it is inserted by hand or by a future script.

export const historicalEra = pgEnum("historical_era", HISTORICAL_ERAS);
export const topicCategory = pgEnum("topic_category", TOPIC_CATEGORIES);
export const recommendationType = pgEnum("recommendation_type", RECOMMENDATION_TYPES);
export const userRole = pgEnum("user_role", USER_ROLES);
export const topicStatus = pgEnum("topic_status", TOPIC_STATUSES);
export const proposalKind = pgEnum("proposal_kind", PROPOSAL_KINDS);
export const proposalStatus = pgEnum("proposal_status", PROPOSAL_STATUSES);

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
    // New topics are drafts unless said otherwise: the safe default is "not public".
    status: topicStatus("status").notNull().default("DRAFT"),
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
    // Same rule as the domain: a draft can be half-written, a published topic cannot.
    check(
      "topics_published_has_introduction",
      sql`${table.status} = 'DRAFT' OR cardinality(${table.introduction}) > 0`,
    ),
    check(
      "topics_published_has_key_facts",
      sql`${table.status} = 'DRAFT' OR jsonb_array_length(${table.keyFacts}) > 0`,
    ),
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

// user_id is empty for the seed comments (written before accounts existed). New comments belong to the
// signed-in user; deleting a user deletes their comments too (right to erasure).
export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("comments_topic_created_idx").on(table.topicId, table.createdAt.desc())],
);

// --- Authentication (Better Auth) ---
// The tables Better Auth 1.7 needs (core/dist/db/get-tables), with plural names (usePlural) and
// snake_case columns. The drizzle adapter maps them through the property names (emailVerified…).
// Passwords never live in `users`: Better Auth stores their scrypt hash in accounts.password.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  // Display name, shown publicly (e.g. as the author of a comment). The email is never shown to others.
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Not a Better Auth field: it never sets it, so every new account starts as USER. Only the
  // admin:grant script changes it.
  role: userRole("role").notNull().default("USER"),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // The value of the session cookie.
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

// One row per way of signing in: "credential" (email and password) today; Google or GitHub could be
// added later as more rows for the same user, without changing this table.
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [index("accounts_user_idx").on(table.userId)],
);

// Single-use tokens (email verification, password reset). Unused until those features arrive.
export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

// --- Proposals (users' contributions, reviewed by an admin) ---
// The common fields are columns (to list and filter); what each kind proposes (an event, a
// recommendation, a correction, a new topic) goes in `payload`, parsed with the domain schema on read.
export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    kind: proposalKind("kind").notNull(),
    // Empty for a new topic. Deleting the topic deletes the proposals about it.
    topicId: text("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    topicTitle: text("topic_title"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    source: text("source").notNull(),
    status: proposalStatus("status").notNull().default("PENDING"),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    index("proposals_user_created_idx").on(table.userId, table.createdAt.desc()),
    index("proposals_status_created_idx").on(table.status, table.createdAt),
    // Same rules as the domain: a proposal about a topic names it; a rejection says why.
    check("proposals_topic_matches_kind", sql`(${table.kind} = 'NEW_TOPIC') = (${table.topicId} IS NULL)`),
    check("proposals_rejection_has_note", sql`${table.status} <> 'REJECTED' OR ${table.reviewNote} IS NOT NULL`),
  ],
);

// --- Mi biblioteca ---
// The primary keys make following or saving twice impossible. Deleting a user deletes their library;
// deleting a topic removes it from every library.

// Following a civilization stores only the era: its topics are read at request time, so new ones appear on their own.
export const eraFollows = pgTable(
  "era_follows",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    era: historicalEra("era").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.era] })],
);

export const savedTopics = pgTable(
  "saved_topics",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    // Set by the server's Clock (not defaultNow) so the order is exact, also in the tests.
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.topicId] })],
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
