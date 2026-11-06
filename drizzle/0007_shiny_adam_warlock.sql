CREATE TYPE "public"."interest_status" AS ENUM('pendiente', 'aceptada', 'rechazada');--> statement-breakpoint
CREATE TABLE "project_interests" (
	"project_id" integer NOT NULL,
	"user_email" text NOT NULL,
	"status" "interest_status" DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_interests_project_id_user_email_pk" PRIMARY KEY("project_id","user_email")
);
--> statement-breakpoint
ALTER TABLE "project_interests" ADD CONSTRAINT "project_interests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;