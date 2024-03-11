CREATE TABLE IF NOT EXISTS "project_version_environment_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"env_var" text NOT NULL,
	"project_version_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_environment_bindings" ADD CONSTRAINT "project_version_environment_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
