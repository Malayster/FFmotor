CREATE TABLE `variation_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`vo_number` text NOT NULL,
	`title` text NOT NULL,
	`reason` text NOT NULL,
	`part_code` text NOT NULL,
	`part_name` text NOT NULL,
	`part_cost` real DEFAULT 0 NOT NULL,
	`labor_cost` real DEFAULT 0 NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`photo_url` text,
	`token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_by` text NOT NULL,
	`customer_phone` text NOT NULL,
	`approved_at` text,
	`customer_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variation_orders_vo_number_unique` ON `variation_orders` (`vo_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `variation_orders_token_unique` ON `variation_orders` (`token`);