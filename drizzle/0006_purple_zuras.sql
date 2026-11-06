ALTER TABLE "projects" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "idea_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE set null ON UPDATE no action;