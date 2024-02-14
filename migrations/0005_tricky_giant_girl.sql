CREATE TABLE IF NOT EXISTS "kv_database" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kv_database_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kv_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"kv_database_id" text NOT NULL,
	CONSTRAINT "kv_entry_key_unique" UNIQUE("key","kv_database_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_version_kv_database_binding" (
	"kv_database_id" text NOT NULL,
	"project_version_id" text NOT NULL,
	CONSTRAINT "project_version_kv_database_binding_kv_database_id_project_version_id_pk" PRIMARY KEY("kv_database_id","project_version_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kv_entry_key_database_index" ON "kv_entry" ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kv_entry_value_database_index" ON "kv_entry" ("value");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_entry" ADD CONSTRAINT "kv_entry_kv_database_id_kv_database_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "public"."kv_database"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_kv_database_binding" ADD CONSTRAINT "project_version_kv_database_binding_kv_database_id_kv_database_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "public"."kv_database"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_kv_database_binding" ADD CONSTRAINT "project_version_kv_database_binding_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
