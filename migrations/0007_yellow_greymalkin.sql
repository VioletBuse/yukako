ALTER TABLE "kv_entry" DROP CONSTRAINT IF EXISTS "kv_entry_pkey";
ALTER TABLE "kv_entry" ADD CONSTRAINT "kv_entry_key_kv_database_id_pk" PRIMARY KEY("key","kv_database_id");--> statement-breakpoint
ALTER TABLE "kv_entry" DROP COLUMN IF EXISTS "id";
