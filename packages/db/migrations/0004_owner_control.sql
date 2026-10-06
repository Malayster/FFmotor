ALTER TABLE `users` ADD COLUMN `photo_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `pin_code` text;--> statement-breakpoint
ALTER TABLE `motorcycles` ADD COLUMN `plate_number` text;--> statement-breakpoint
ALTER TABLE `motorcycles` ADD COLUMN `photo_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `photo_url` text;--> statement-breakpoint
UPDATE `users` SET `pin_code` = '8899' WHERE `id` = 'usr_admin';--> statement-breakpoint
UPDATE `users` SET `pin_code` = '1122' WHERE `id` = 'usr_mech1';--> statement-breakpoint
UPDATE `users` SET `pin_code` = '3344' WHERE `id` = 'usr_cashier';--> statement-breakpoint
UPDATE `users` SET `pin_code` = '5566' WHERE `id` = 'usr_sales';--> statement-breakpoint
CREATE TABLE `unit_holds` (
	`id` text PRIMARY KEY NOT NULL,
	`motorcycle_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`kind` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`slip_ref` text,
	`slip_image` text,
	`affiliate_code` text,
	`quoted_price` real NOT NULL,
	`quote_expires_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE TABLE `part_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real NOT NULL,
	`fulfillment` text NOT NULL,
	`shipping_cost` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending_match' NOT NULL,
	`slip_ref` text,
	`tracking_number` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE TABLE `service_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`bay` integer NOT NULL,
	`slot_date` text NOT NULL,
	`slot_time` text NOT NULL,
	`plate` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`service_type` text NOT NULL,
	`status` text DEFAULT 'booked' NOT NULL,
	`work_order_id` text,
	`created_at` text NOT NULL
);--> statement-breakpoint
CREATE TABLE `price_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`motorcycle_id` text NOT NULL,
	`old_price` real NOT NULL,
	`new_price` real NOT NULL,
	`below_cost` integer DEFAULT 0 NOT NULL,
	`changed_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE TABLE `distributor_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`distributor` text NOT NULL,
	`motorcycle_id` text,
	`amount` real NOT NULL,
	`status` text DEFAULT 'accrued' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`received_at` text
);--> statement-breakpoint
CREATE TABLE `arahan` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`target_role` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_by` text NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` text NOT NULL,
	`done_at` text
);
