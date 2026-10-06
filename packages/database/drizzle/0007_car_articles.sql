CREATE TYPE "public"."car_article_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "car_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"author_id" uuid,
	"tieu_de" varchar(255) NOT NULL,
	"tom_tat" text,
	"noi_dung" jsonb NOT NULL,
	"status" "car_article_status" DEFAULT 'draft' NOT NULL,
	"focus_keyword" varchar(255),
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"reading_time" integer DEFAULT 1 NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_car_id_cars_id_fk";
--> statement-breakpoint
DROP INDEX "posts_car_status_idx";--> statement-breakpoint
DROP INDEX "posts_car_idx";--> statement-breakpoint
ALTER TABLE "car_articles" ADD CONSTRAINT "car_articles_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_articles" ADD CONSTRAINT "car_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "car_articles_car_id_uidx" ON "car_articles" USING btree ("car_id");--> statement-breakpoint
-- 🧠 Data migration: chuyển bài viết đang gán "Dòng xe áp dụng" thành Car Article (mỗi xe lấy 1 bài: ưu tiên published, mới nhất)
INSERT INTO "car_articles" ("car_id", "author_id", "tieu_de", "tom_tat", "noi_dung", "status", "focus_keyword", "meta_title", "meta_description", "reading_time", "word_count", "published_at")
SELECT DISTINCT ON (p."car_id")
	p."car_id", p."author_id", p."tieu_de", p."tom_tat", p."noi_dung",
	CASE WHEN p."status" = 'published' THEN 'published'::"car_article_status" ELSE 'draft'::"car_article_status" END,
	p."focus_keyword", p."meta_title", p."meta_description", p."reading_time", p."word_count", p."published_at"
FROM "posts" p
WHERE p."car_id" IS NOT NULL
ORDER BY p."car_id", (p."status" = 'published') DESC, COALESCE(p."published_at", p."created_at") DESC;--> statement-breakpoint
-- Bài gốc rời khỏi Hub Tin tức (giữ lại bản ghi để không gãy FK leads.post_id)
UPDATE "posts" SET "status" = 'archived' WHERE "car_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "car_id";