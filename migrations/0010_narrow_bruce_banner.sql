ALTER TABLE "kv_database" RENAME TO "kv_databases";--> statement-breakpoint
ALTER TABLE "kv_databases" DROP CONSTRAINT "kv_database_name_unique";--> statement-breakpoint
ALTER TABLE "kv_entry" DROP CONSTRAINT "kv_entry_kv_database_id_kv_database_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_kv_database_binding" DROP CONSTRAINT "project_version_kv_database_binding_kv_database_id_kv_database_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_entry" ADD CONSTRAINT "kv_entry_kv_database_id_kv_databases_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_kv_database_binding" ADD CONSTRAINT "project_version_kv_database_binding_kv_database_id_kv_databases_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "kv_databases" ADD CONSTRAINT "kv_databases_name_unique" UNIQUE("name");