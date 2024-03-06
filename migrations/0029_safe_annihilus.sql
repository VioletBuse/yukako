ALTER TABLE "secrets" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "projectId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "secrets" ALTER COLUMN "value" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "secret_bindings" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "secrets" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;