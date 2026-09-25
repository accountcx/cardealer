CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'scheduled', 'archived');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ten_chuyen_muc" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"mo_ta" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"tag" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tieu_de" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"author_id" uuid,
	"anh_dai_dien_url" varchar(500) NOT NULL,
	"anh_dai_dien_alt" varchar(255) NOT NULL,
	"tom_tat" text,
	"noi_dung" jsonb NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"expired_promo_date" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer DEFAULT 0 NOT NULL,
	"reading_time" integer DEFAULT 1 NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"canonical_url" varchar(500),
	"no_index" boolean DEFAULT false NOT NULL,
	"preview_token" varchar(64),
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"old_path" varchar(500) NOT NULL,
	"new_path" varchar(500) NOT NULL,
	"status_code" integer DEFAULT 301 NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "car_model_interested" varchar(150);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "post_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "author_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "source_type" varchar(50) DEFAULT 'web_form';--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_source" varchar(100);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_medium" varchar(100);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_campaign" varchar(100);--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_sort_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "post_tags_post_id_idx" ON "post_tags" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_tags_tag_idx" ON "post_tags" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_scheduled_idx" ON "posts" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "posts_category_status_idx" ON "posts" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "posts_featured_idx" ON "posts" USING btree ("is_featured","featured_order");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "redirects_old_path_uidx" ON "redirects" USING btree ("old_path");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_leads_post_id" ON "leads" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_leads_author_id" ON "leads" USING btree ("author_id");