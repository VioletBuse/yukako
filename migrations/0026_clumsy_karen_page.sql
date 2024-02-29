DO $$ BEGIN
 CREATE TYPE "cron_job_status" AS ENUM('scheduled', 'running', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
	"project_id" text NOT NULL,
	CONSTRAINT "cron_jobs_name_project_id_pk" PRIMARY KEY("name","project_id")
);
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
