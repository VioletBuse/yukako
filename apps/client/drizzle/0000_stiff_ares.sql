CREATE TABLE `dev_kv_entry` (
	`kv_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`key`, `kv_id`)
);
