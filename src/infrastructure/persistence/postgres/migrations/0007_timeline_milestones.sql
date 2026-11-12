CREATE TABLE "timeline_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"era" "historical_era" NOT NULL,
	"date_year" integer NOT NULL,
	"date_month" smallint,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"topic_id" text,
	CONSTRAINT "timeline_milestones_year_valid" CHECK ("timeline_milestones"."date_year" IS NULL OR "timeline_milestones"."date_year" <> 0),
	CONSTRAINT "timeline_milestones_month_valid" CHECK ("timeline_milestones"."date_month" IS NULL OR "timeline_milestones"."date_month" BETWEEN 1 AND 12)
);
--> statement-breakpoint
ALTER TABLE "timeline_milestones" ADD CONSTRAINT "timeline_milestones_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timeline_milestones_era_idx" ON "timeline_milestones" USING btree ("era");