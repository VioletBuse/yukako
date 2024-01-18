CREATE TABLE IF NOT EXISTS "project_version_data_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"base64" text NOT NULL,
	"project_version_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_version_json_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" json NOT NULL,
	"project_version_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_version_text_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"project_version_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_data_bindings" ADD CONSTRAINT "project_version_data_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_json_bindings" ADD CONSTRAINT "project_version_json_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_text_bindings" ADD CONSTRAINT "project_version_text_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
