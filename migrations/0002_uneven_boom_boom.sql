CREATE TABLE IF NOT EXISTS "project_version_queue_bindings" (
	"queue_id" text NOT NULL,
	"project_version_id" text NOT NULL,
	CONSTRAINT "project_version_queue_bindings_queue_id_project_version_id_pk" PRIMARY KEY("queue_id","project_version_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queue_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"queue_id" text NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queues" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_queue_bindings" ADD CONSTRAINT "project_version_queue_bindings_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_queue_bindings" ADD CONSTRAINT "project_version_queue_bindings_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "queue_jobs" ADD CONSTRAINT "queue_jobs_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
