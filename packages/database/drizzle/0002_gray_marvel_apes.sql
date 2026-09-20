CREATE TYPE "public"."lead_status_enum" AS ENUM('new', 'contacted', 'converted', 'cancelled');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"car_version_id" uuid,
	"province" varchar(100) DEFAULT 'Vinh' NOT NULL,
	"estimated_total" bigint,
	"status" "lead_status_enum" DEFAULT 'new' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_car_version_id_car_versions_id_fk" FOREIGN KEY ("car_version_id") REFERENCES "public"."car_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_leads_phone_created" ON "leads" USING btree ("phone","created_at");--> statement-breakpoint
CREATE INDEX "idx_leads_status_created" ON "leads" USING btree ("status","created_at");