CREATE TABLE "era_follows" (
	"user_id" text NOT NULL,
	"era" "historical_era" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "era_follows_user_id_era_pk" PRIMARY KEY("user_id","era")
);
--> statement-breakpoint
CREATE TABLE "saved_topics" (
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"saved_at" timestamp with time zone NOT NULL,
	CONSTRAINT "saved_topics_user_id_topic_id_pk" PRIMARY KEY("user_id","topic_id")
);
--> statement-breakpoint
ALTER TABLE "era_follows" ADD CONSTRAINT "era_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_topics" ADD CONSTRAINT "saved_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_topics" ADD CONSTRAINT "saved_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;