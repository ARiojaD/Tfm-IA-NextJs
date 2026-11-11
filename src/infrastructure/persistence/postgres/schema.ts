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
  vector,
} from "drizzle-orm/pg-core";
// Imports relativos: drizzle-kit carga este archivo por su cuenta y no conoce el alias "@/".
import { KNOWLEDGE_SOURCES } from "../../../domain/entities/KnowledgeChunk";
import { PROPOSAL_KINDS, PROPOSAL_STATUSES } from "../../../domain/entities/Proposal";
import type { KeyFact } from "../../../domain/value-objects/KeyFact";
import type { TopicImage } from "../../../domain/value-objects/TopicImage";
import { HISTORICAL_ERAS } from "../../../domain/value-objects/HistoricalEra";
import { RECOMMENDATION_TYPES } from "../../../domain/value-objects/RecommendationType";
import { TOPIC_CATEGORIES } from "../../../domain/value-objects/TopicCategory";
import { TOPIC_STATUSES } from "../../../domain/value-objects/TopicStatus";
import { USER_ROLES } from "../../../domain/value-objects/UserRole";
import { EMBEDDING_DIMENSIONS } from "../../ai/embeddingModel";

// Las tablas de PostgreSQL para las entidades del dominio. El dominio (los esquemas de Zod) sigue siendo
// la fuente de verdad: los enums reutilizan sus constantes, y las restricciones CHECK repiten sus reglas
// clave como segunda línea de defensa, para que una fila errónea se rechace aunque se inserte a mano o
// desde un script futuro.

export const historicalEra = pgEnum("historical_era", HISTORICAL_ERAS);
export const topicCategory = pgEnum("topic_category", TOPIC_CATEGORIES);
export const recommendationType = pgEnum("recommendation_type", RECOMMENDATION_TYPES);
export const userRole = pgEnum("user_role", USER_ROLES);
export const topicStatus = pgEnum("topic_status", TOPIC_STATUSES);
export const proposalKind = pgEnum("proposal_kind", PROPOSAL_KINDS);
export const proposalStatus = pgEnum("proposal_status", PROPOSAL_STATUSES);
export const knowledgeSource = pgEnum("knowledge_source", KNOWLEDGE_SOURCES);

// Fechas históricas: los años negativos son antes de Cristo, el año 0 no existe y el mes es opcional.
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
    // El periodo en columnas normales (no en JSON) para que la base de datos pueda ordenar los temas
    // cronológicamente.
    periodStartYear: integer("period_start_year").notNull(),
    periodStartMonth: smallint("period_start_month"),
    periodEndYear: integer("period_end_year"),
    periodEndMonth: smallint("period_end_month"),
    // Listas ordenadas que siempre se leen enteras con su tema: un array y JSONB bastan.
    introduction: text("introduction").array().notNull(),
    keyFacts: jsonb("key_facts").$type<KeyFact[]>().notNull(),
    image: jsonb("image").$type<TopicImage>(),
    // Los temas nuevos son borradores salvo que se diga otra cosa: el valor seguro por defecto es "no
    // público".
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
    // La misma regla que el dominio: un borrador puede estar a medias; un tema publicado, no.
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

// Temas relacionados: una fila por sentido (César → Alesia y Alesia → César), como en el dominio.
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

// Un quiz por tema; sus preguntas conservan el orden con `position`.
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

// `user_id` está vacío en los comentarios del seed (escritos antes de que existieran las cuentas). Los
// comentarios nuevos son del usuario con sesión; borrar un usuario borra también sus comentarios (derecho
// de supresión).
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

// --- Autenticación (Better Auth) ---
// Las tablas que necesita Better Auth 1.7 (core/dist/db/get-tables), con nombres en plural (`usePlural`)
// y columnas en snake_case. El adaptador de Drizzle las relaciona por el nombre de las propiedades
// (`emailVerified`…). Las contraseñas nunca están en `users`: Better Auth guarda su hash scrypt en
// `accounts.password`.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  // El nombre público (por ejemplo, como autor de un comentario). El correo nunca se muestra a los demás.
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // No es un campo de Better Auth: nunca lo escribe, así que toda cuenta nueva empieza como USER. Solo lo
  // cambia el script admin:grant.
  role: userRole("role").notNull().default("USER"),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // El valor de la cookie de sesión.
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

// Una fila por cada forma de iniciar sesión: hoy "credential" (correo y contraseña); más adelante se
// podrían añadir Google o GitHub como filas nuevas del mismo usuario, sin cambiar esta tabla.
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

// Tokens de un solo uso (verificación de correo, cambio de contraseña). Sin usar hasta que lleguen esas
// funciones.
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

// --- Propuestas (contribuciones de los usuarios, revisadas por un administrador) ---
// Los campos comunes son columnas (para listar y filtrar); lo que propone cada tipo (un evento, una
// recomendación, una corrección, un tema nuevo) va en `payload`, que se valida con el esquema del dominio
// al leerlo.
export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    kind: proposalKind("kind").notNull(),
    // Vacío para un tema nuevo. Borrar el tema borra las propuestas sobre él.
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
    // Las mismas reglas que el dominio: una propuesta sobre un tema lo nombra; un rechazo dice por qué.
    check("proposals_topic_matches_kind", sql`(${table.kind} = 'NEW_TOPIC') = (${table.topicId} IS NULL)`),
    check("proposals_rejection_has_note", sql`${table.status} <> 'REJECTED' OR ${table.reviewNote} IS NOT NULL`),
  ],
);

// --- Mi biblioteca ---
// Las claves primarias impiden seguir o guardar dos veces. Borrar un usuario borra su biblioteca; borrar
// un tema lo quita de todas las bibliotecas.

// Seguir una civilización guarda solo la era: sus temas se leen en cada petición, así que los nuevos
// aparecen solos.
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
    // Lo pone el `Clock` del servidor (no `defaultNow`) para que el orden sea exacto, también en los tests.
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

// --- RAG ---
// Los fragmentos de los temas publicados con su vector (pgvector). Un tema siempre se sustituye entero, y
// borrarlo borra sus fragmentos. El índice HNSW encuentra los vectores más cercanos sin leerlos todos.
export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    source: knowledgeSource("source").notNull(),
    position: integer("position").notNull(),
    // Sin clave foránea: la cronología se sustituye en cada edición y el tema se reindexa justo después.
    eventId: text("event_id"),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.topicId, table.source, table.position] }),
    index("knowledge_chunks_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
    check("knowledge_chunks_position_valid", sql`${table.position} >= 0`),
    check("knowledge_chunks_event_matches_source", sql`(${table.source} = 'EVENT') = (${table.eventId} IS NOT NULL)`),
  ],
);
