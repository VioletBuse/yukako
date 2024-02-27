CREATE TABLE IF NOT EXISTS "yukako_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"last_online" timestamp DEFAULT now() NOT NULL
);
