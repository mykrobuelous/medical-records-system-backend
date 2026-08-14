CREATE TABLE "diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diagnosis" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insurance" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"medicine" varchar(255) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "insurance" varchar(36) NOT NULL;