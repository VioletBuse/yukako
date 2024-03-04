CREATE TABLE IF NOT EXISTS "secret_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"secret_name" text NOT NULL,
	"secret_project_id" text NOT NULL,
	"version_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "secrets" (
	"name" text,
	"projectId" text,
	"value" text,
	"disabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "secrets_name_projectId_pk" PRIMARY KEY("name","projectId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secret_bindings" ADD CONSTRAINT "secret_bindings_secret_name_secrets_name_fk" FOREIGN KEY ("secret_name") REFERENCES "secrets"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secret_bindings" ADD CONSTRAINT "secret_bindings_secret_project_id_secrets_projectId_fk" FOREIGN KEY ("secret_project_id") REFERENCES "secrets"("projectId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secret_bindings" ADD CONSTRAINT "secret_bindings_version_id_projects_id_fk" FOREIGN KEY ("version_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secrets" ADD CONSTRAINT "secrets_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
