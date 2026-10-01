CREATE TABLE "static_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"template_type" varchar(50) DEFAULT 'DEFAULT' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"canonical_url" varchar(500),
	"og_image" varchar(500),
	"no_index" boolean DEFAULT false NOT NULL,
	"schema_type" varchar(50) DEFAULT 'WebPage',
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "static_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "static_pages" ADD CONSTRAINT "static_pages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "static_pages" ADD CONSTRAINT "static_pages_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "static_pages_slug_uidx" ON "static_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "static_pages_slug_published_idx" ON "static_pages" USING btree ("slug","is_published");--> statement-breakpoint
CREATE INDEX "static_pages_admin_list_idx" ON "static_pages" USING btree ("is_published","template_type","updated_at");--> statement-breakpoint
CREATE INDEX "static_pages_created_by_idx" ON "static_pages" USING btree ("created_by");