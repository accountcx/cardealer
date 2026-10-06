DROP INDEX IF EXISTS "post_tags_post_id_idx";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "car_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "focus_keyword" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_tags_post_tag_idx" ON "post_tags" USING btree ("post_id","tag");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_car_status_idx" ON "posts" USING btree ("car_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_car_idx" ON "posts" USING btree ("car_id");