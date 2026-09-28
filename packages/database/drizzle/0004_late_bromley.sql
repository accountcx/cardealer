ALTER TABLE "media" ADD COLUMN "public_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "format" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "folder" varchar(100) DEFAULT 'cardealer';--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "uploader_id" uuid;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_filename_idx" ON "media" USING btree ("filename");--> statement-breakpoint
CREATE INDEX "media_public_id_idx" ON "media" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "media_uploader_id_idx" ON "media" USING btree ("uploader_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_public_id_unique" UNIQUE("public_id");