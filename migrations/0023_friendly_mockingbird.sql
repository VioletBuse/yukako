DO $$ BEGIN
 CREATE TYPE "cron_job_status" AS ENUM('scheduled', 'running', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_job_bindings" (
	"cron_job_id" text NOT NULL,
	"project_version_id" text NOT NULL,
	CONSTRAINT "cron_job_bindings_cron_job_id_project_version_id_pk" PRIMARY KEY("cron_job_id","project_version_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_job_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"cron_job_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" "cron_job_status" NOT NULL,
	"result" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ran_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cron" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cron_job_bindings" ADD CONSTRAINT "cron_job_bindings_cron_job_id_cron_jobs_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "cron_jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cron_job_bindings" ADD CONSTRAINT "cron_job_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cron_job_logs" ADD CONSTRAINT "cron_job_logs_cron_job_id_cron_jobs_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "cron_jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
