ALTER TABLE "kv_entry" RENAME TO "kv_entries";--> statement-breakpoint
ALTER TABLE "kv_entries" DROP CONSTRAINT "kv_entry_kv_database_id_kv_databases_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kv_entries" ADD CONSTRAINT "kv_entries_kv_database_id_kv_databases_id_fk" FOREIGN KEY ("kv_database_id") REFERENCES "kv_databases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
