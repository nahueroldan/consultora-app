ALTER TABLE "people" ADD COLUMN "visibility" jsonb DEFAULT '{"country":true,"city":true,"position":true,"linkedin":true,"skills":true}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "link_requested" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_person_id_idx" ON "users" USING btree ("person_id");