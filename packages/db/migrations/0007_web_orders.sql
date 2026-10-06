CREATE TABLE `web_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`address` text,
	`fulfillment` text NOT NULL,
	`status` text DEFAULT 'menunggu_semakan' NOT NULL,
	`payment_note` text,
	`tracking_number` text,
	`reject_reason` text,
	`handled_by` text,
	`created_at` text NOT NULL,
	`paid_at` text,
	`closed_at` text
);--> statement-breakpoint
CREATE TABLE `web_order_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`unit_price` real NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`video_url` text
);
