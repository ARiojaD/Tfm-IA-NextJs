-- Added by hand: drizzle-kit does not create extensions. pgvector provides the vector type and HNSW.
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."knowledge_source" AS ENUM('INTRODUCTION', 'KEY_FACT', 'EVENT');--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"topic_id" text NOT NULL,
	"source" "knowledge_source" NOT NULL,
	"position" integer NOT NULL,
	"event_id" text,
	"content" text NOT NULL,
	"embedding" vector(384) NOT NULL,
	CONSTRAINT "knowledge_chunks_topic_id_source_position_pk" PRIMARY KEY("topic_id","source","position"),
	CONSTRAINT "knowledge_chunks_position_valid" CHECK ("knowledge_chunks"."position" >= 0),
	CONSTRAINT "knowledge_chunks_event_matches_source" CHECK (("knowledge_chunks"."source" = 'EVENT') = ("knowledge_chunks"."event_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "knowledge_chunks_embedding_idx" ON "knowledge_chunks" USING hnsw ("embedding" vector_cosine_ops);