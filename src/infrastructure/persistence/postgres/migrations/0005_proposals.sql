CREATE TYPE "public"."proposal_kind" AS ENUM('EVENT', 'RECOMMENDATION', 'CORRECTION', 'NEW_TOPIC');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"author_name" text NOT NULL,
	"kind" "proposal_kind" NOT NULL,
	"topic_id" text,
	"topic_title" text,
	"payload" jsonb NOT NULL,
	"source" text NOT NULL,
	"status" "proposal_status" DEFAULT 'PENDING' NOT NULL,
	"review_note" text,
	"created_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	CONSTRAINT "proposals_topic_matches_kind" CHECK (("proposals"."kind" = 'NEW_TOPIC') = ("proposals"."topic_id" IS NULL)),
	CONSTRAINT "proposals_rejection_has_note" CHECK ("proposals"."status" <> 'REJECTED' OR "proposals"."review_note" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "proposals_user_created_idx" ON "proposals" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "proposals_status_created_idx" ON "proposals" USING btree ("status","created_at");