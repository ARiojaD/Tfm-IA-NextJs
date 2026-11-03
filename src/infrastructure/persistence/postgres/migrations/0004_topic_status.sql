CREATE TYPE "public"."topic_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
ALTER TABLE "topics" DROP CONSTRAINT "topics_introduction_not_empty";--> statement-breakpoint
-- Edited by hand: the topics that already exist were public, so they start as PUBLISHED; only then the
-- default becomes DRAFT, for the topics created from now on.
ALTER TABLE "topics" ADD COLUMN "status" "topic_status" DEFAULT 'PUBLISHED' NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_published_has_introduction" CHECK ("topics"."status" = 'DRAFT' OR cardinality("topics"."introduction") > 0);--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_published_has_key_facts" CHECK ("topics"."status" = 'DRAFT' OR jsonb_array_length("topics"."key_facts") > 0);