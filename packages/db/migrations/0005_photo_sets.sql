ALTER TABLE `motorcycles` ADD COLUMN `listing_status` text DEFAULT 'draf' NOT NULL;--> statement-breakpoint
ALTER TABLE `motorcycles` ADD COLUMN `listing_note` text;--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `listing_status` text DEFAULT 'draf' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `listing_note` text;--> statement-breakpoint
CREATE TABLE `item_shots` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`slot` text NOT NULL,
	`label` text,
	`image` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` text NOT NULL
);
