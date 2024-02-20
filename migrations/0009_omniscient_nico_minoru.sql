ALTER TABLE "new_user_tokens" DROP CONSTRAINT "new_user_tokens_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_data_bindings" DROP CONSTRAINT "project_version_data_bindings_project_version_id_project_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_json_bindings" DROP CONSTRAINT "project_version_json_bindings_project_version_id_project_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_text_bindings" DROP CONSTRAINT "project_version_text_bindings_project_version_id_project_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_blobs" DROP CONSTRAINT "project_version_blobs_blob_id_data_blobs_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_routes" DROP CONSTRAINT "project_version_routes_project_version_id_project_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "project_versions" DROP CONSTRAINT "project_versions_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "kv_entry" DROP CONSTRAINT "kv_entry_kv_database_id_kv_database_id_fk";
--> statement-breakpoint
ALTER TABLE "project_version_kv_database_binding" DROP CONSTRAINT "project_version_kv_database_binding_kv_database_id_kv_database_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "new_user_tokens" ADD CONSTRAINT "new_user_tokens_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "kv_entry" ADD CONSTRAINT "kv_entry_kv_database_id_kv_database_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_database"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_version_kv_database_binding" ADD CONSTRAINT "project_version_kv_database_binding_kv_database_id_kv_database_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_database"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
