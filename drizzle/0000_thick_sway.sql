CREATE TYPE "public"."person_status" AS ENUM('pending', 'confirmed');--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_key" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"country" text,
	"area" text,
	"position" text,
	"role" text,
	"city" text,
	"linkedin" text,
	"status" "person_status" DEFAULT 'pending' NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "person_skills" (
	"person_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	"level" integer,
	CONSTRAINT "person_skills_person_id_skill_id_pk" PRIMARY KEY("person_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "person_skills" ADD CONSTRAINT "person_skills_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_skills" ADD CONSTRAINT "person_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "people_external_key_idx" ON "people" USING btree ("external_key");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_name_idx" ON "skills" USING btree ("name");