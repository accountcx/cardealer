CREATE TYPE "public"."content_plan_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "auto_post_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_type" varchar(30) NOT NULL,
	"plan_item_id" uuid,
	"post_id" uuid,
	"post_title" varchar(255),
	"status" varchar(20) NOT NULL,
	"error_message" text,
	"execution_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto_post_settings" (
	"id" varchar(50) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"cron_expression" varchar(50) DEFAULT '0 8 * * *' NOT NULL,
	"default_status" varchar(20) DEFAULT 'draft' NOT NULL,
	"default_category_id" uuid,
	"default_author_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255),
	"focus_keyword" varchar(255) NOT NULL,
	"category_id" uuid,
	"target_car" varchar(100),
	"angle" text,
	"summary" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "content_plan_status" DEFAULT 'pending' NOT NULL,
	"post_id" uuid,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "promotion_summary" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auto_post_logs" ADD CONSTRAINT "auto_post_logs_plan_item_id_content_plan_items_id_fk" FOREIGN KEY ("plan_item_id") REFERENCES "public"."content_plan_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_post_logs" ADD CONSTRAINT "auto_post_logs_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_post_settings" ADD CONSTRAINT "auto_post_settings_default_category_id_categories_id_fk" FOREIGN KEY ("default_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_post_settings" ADD CONSTRAINT "auto_post_settings_default_author_id_users_id_fk" FOREIGN KEY ("default_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_plan_items" ADD CONSTRAINT "content_plan_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_plan_items" ADD CONSTRAINT "content_plan_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auto_post_logs_created_idx" ON "auto_post_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auto_post_logs_status_idx" ON "auto_post_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_plan_status_scheduled_idx" ON "content_plan_items" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "content_plan_category_idx" ON "content_plan_items" USING btree ("category_id");