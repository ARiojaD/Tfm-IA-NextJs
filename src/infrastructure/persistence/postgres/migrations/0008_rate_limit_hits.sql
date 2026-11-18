CREATE TABLE "rate_limit_hits" (
	"limiter" text NOT NULL,
	"key_hash" text NOT NULL,
	"at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_hits_lookup_idx" ON "rate_limit_hits" USING btree ("limiter","key_hash","at");