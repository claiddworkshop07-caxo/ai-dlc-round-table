CREATE TYPE "public"."equipment_status" AS ENUM('available', 'borrowed');--> statement-breakpoint
CREATE TYPE "public"."lending_status" AS ENUM('active', 'returned');--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"description" text,
	"location" varchar(255),
	"status" "equipment_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lending_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"borrower_name" varchar(255) NOT NULL,
	"borrowed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" date NOT NULL,
	"returned_at" timestamp with time zone,
	"memo" text,
	"status" "lending_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lending_records_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action
);
