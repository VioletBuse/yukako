CREATE TABLE IF NOT EXISTS "site_files" (
	"id" text PRIMARY KEY NOT NULL,
	"base64" text NOT NULL,
	"site_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"version_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_files" ADD CONSTRAINT "site_files_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sites" ADD CONSTRAINT "sites_version_id_project_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
