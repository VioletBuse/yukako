ALTER TABLE "project_version_kv_database_binding" RENAME TO "project_version_kv_database_bindings";--> statement-breakpoint
ALTER TABLE "project_version_kv_database_bindings" DROP CONSTRAINT "project_version_kv_database_binding_kv_database_id_kv_databases_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_kv_database_bindings" DROP CONSTRAINT "project_version_kv_database_binding_project_version_id_project_versions_id_fk";
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
