CREATE TABLE `capture_docs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'resit' NOT NULL,
	`note` text,
	`status` text DEFAULT 'draf' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
