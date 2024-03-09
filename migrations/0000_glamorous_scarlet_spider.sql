DO $$ BEGIN
 CREATE TYPE "data_blob_type" AS ENUM('esmodule', 'wasm', 'json', 'text', 'data');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "cron_job_status" AS ENUM('scheduled', 'running', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "new_user_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"new_user_id" text,
	"valid" boolean DEFAULT true NOT NULL,
	CONSTRAINT "new_user_tokens_new_user_id_unique" UNIQUE("new_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"valid" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
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
CREATE TABLE IF NOT EXISTS "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_blobs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"data" text NOT NULL,
	"filename" text NOT NULL,
	"type" "data_blob_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_version_blobs" (
	"id" text PRIMARY KEY NOT NULL,
	"blob_id" text NOT NULL,
	"project_version_id" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_version_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"project_version_id" text NOT NULL,
	"host" text NOT NULL,
	"base_paths" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kv_databases" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kv_databases_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kv_entries" (
	"key" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"kv_database_id" text NOT NULL,
	CONSTRAINT "kv_entries_key_kv_database_id_pk" PRIMARY KEY("key","kv_database_id"),
	CONSTRAINT "kv_entry_key_unique" UNIQUE("key","kv_database_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_version_kv_database_bindings" (
	"kv_database_id" text NOT NULL,
	"project_version_id" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "project_version_kv_database_bindings_kv_database_id_project_version_id_pk" PRIMARY KEY("kv_database_id","project_version_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_files" (
	"id" text PRIMARY KEY NOT NULL,
	"base64" text NOT NULL,
	"path" text NOT NULL,
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
CREATE TABLE IF NOT EXISTS "yukako_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"last_online" timestamp DEFAULT now() NOT NULL,
	"online_since" timestamp DEFAULT now() NOT NULL,
	"worker_count" integer NOT NULL,
	"node_registration_manager_lock" boolean DEFAULT false NOT NULL,
	"project_locks" jsonb DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_job_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"cron_job_name" text NOT NULL,
	"cron_job_project_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" "cron_job_status" NOT NULL,
	"result" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ran_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_jobs" (
	"name" text NOT NULL,
	"cron" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"project_id" text NOT NULL,
	CONSTRAINT "cron_jobs_name_project_id_pk" PRIMARY KEY("name","project_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kv_entry_key_database_index" ON "kv_entries" ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kv_entry_value_database_index" ON "kv_entries" ("value");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "new_user_tokens" ADD CONSTRAINT "new_user_tokens_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "new_user_tokens" ADD CONSTRAINT "new_user_tokens_new_user_id_users_id_fk" FOREIGN KEY ("new_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_data_bindings" ADD CONSTRAINT "project_version_data_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_json_bindings" ADD CONSTRAINT "project_version_json_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_text_bindings" ADD CONSTRAINT "project_version_text_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_blobs" ADD CONSTRAINT "project_version_blobs_blob_id_data_blobs_id_fk" FOREIGN KEY ("blob_id") REFERENCES "data_blobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_blobs" ADD CONSTRAINT "project_version_blobs_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_routes" ADD CONSTRAINT "project_version_routes_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_entries" ADD CONSTRAINT "kv_entries_kv_database_id_kv_databases_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_kv_database_bindings" ADD CONSTRAINT "project_version_kv_database_bindings_kv_database_id_kv_databases_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_kv_database_bindings" ADD CONSTRAINT "project_version_kv_database_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cron_job_logs" ADD CONSTRAINT "cron_job_logs_cron_job_fkey" FOREIGN KEY ("cron_job_name","cron_job_project_id") REFERENCES "cron_jobs"("name","project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
