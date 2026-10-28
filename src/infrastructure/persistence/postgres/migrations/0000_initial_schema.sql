CREATE TYPE "public"."historical_era" AS ENUM('ANCIENT_GREECE', 'ROMAN', 'HISPANIA');--> statement-breakpoint
CREATE TYPE "public"."recommendation_type" AS ENUM('BOOK', 'FILM', 'SERIES');--> statement-breakpoint
CREATE TYPE "public"."topic_category" AS ENUM('PEOPLE', 'WARS_AND_BATTLES', 'PERIODS', 'CITIES');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"author" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historical_events" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"title" text NOT NULL,
	"date_year" integer NOT NULL,
	"date_month" smallint,
	"era" "historical_era" NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "historical_events_year_valid" CHECK ("historical_events"."date_year" IS NULL OR "historical_events"."date_year" <> 0),
	CONSTRAINT "historical_events_month_valid" CHECK ("historical_events"."date_month" IS NULL OR "historical_events"."date_month" BETWEEN 1 AND 12)
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"position" smallint NOT NULL,
	"question" text NOT NULL,
	"options" text[] NOT NULL,
	"correct_option_index" smallint NOT NULL,
	"explanation" text,
	CONSTRAINT "quiz_questions_quiz_position_unique" UNIQUE("quiz_id","position"),
	CONSTRAINT "quiz_questions_two_options" CHECK (cardinality("quiz_questions"."options") >= 2),
	CONSTRAINT "quiz_questions_correct_option_valid" CHECK ("quiz_questions"."correct_option_index" >= 0 AND "quiz_questions"."correct_option_index" < cardinality("quiz_questions"."options"))
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	CONSTRAINT "quizzes_topic_id_unique" UNIQUE("topic_id")
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"type" "recommendation_type" NOT NULL,
	"title" text NOT NULL,
	"creator" text NOT NULL,
	"year" integer NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_relations" (
	"topic_id" text NOT NULL,
	"related_topic_id" text NOT NULL,
	CONSTRAINT "topic_relations_topic_id_related_topic_id_pk" PRIMARY KEY("topic_id","related_topic_id"),
	CONSTRAINT "topic_relations_not_self" CHECK ("topic_relations"."topic_id" <> "topic_relations"."related_topic_id")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"era" "historical_era" NOT NULL,
	"category" "topic_category" NOT NULL,
	"summary" text NOT NULL,
	"period_start_year" integer NOT NULL,
	"period_start_month" smallint,
	"period_end_year" integer,
	"period_end_month" smallint,
	"introduction" text[] NOT NULL,
	"key_facts" jsonb NOT NULL,
	"image" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug"),
	CONSTRAINT "topics_period_start_year_valid" CHECK ("topics"."period_start_year" IS NULL OR "topics"."period_start_year" <> 0),
	CONSTRAINT "topics_period_start_month_valid" CHECK ("topics"."period_start_month" IS NULL OR "topics"."period_start_month" BETWEEN 1 AND 12),
	CONSTRAINT "topics_period_end_year_valid" CHECK ("topics"."period_end_year" IS NULL OR "topics"."period_end_year" <> 0),
	CONSTRAINT "topics_period_end_month_valid" CHECK ("topics"."period_end_month" IS NULL OR "topics"."period_end_month" BETWEEN 1 AND 12),
	CONSTRAINT "topics_period_end_after_start" CHECK ("topics"."period_end_year" IS NULL OR "topics"."period_end_year" >= "topics"."period_start_year"),
	CONSTRAINT "topics_introduction_not_empty" CHECK (cardinality("topics"."introduction") > 0)
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historical_events" ADD CONSTRAINT "historical_events_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_related_topic_id_topics_id_fk" FOREIGN KEY ("related_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_topic_created_idx" ON "comments" USING btree ("topic_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "historical_events_topic_idx" ON "historical_events" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "recommendations_topic_idx" ON "recommendations" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "topics_era_category_idx" ON "topics" USING btree ("era","category");