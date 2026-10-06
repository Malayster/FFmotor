CREATE TABLE `quotation_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quotation_id` text NOT NULL,
	`description` text NOT NULL,
	`item_type` text DEFAULT 'part' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`total_price` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`plate_number` text NOT NULL,
	`bike_model` text NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`discount_percent` real DEFAULT 0 NOT NULL,
	`discount_amount` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`requires_director_approval` integer DEFAULT false NOT NULL,
	`is_approved_by_director` integer DEFAULT false,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	`valid_until` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotations_quote_number_unique` ON `quotations` (`quote_number`);--> statement-breakpoint
CREATE TABLE `bike_locks` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_no` text NOT NULL,
	`motorcycle_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_ic` text,
	`deposit_amount` real DEFAULT 0 NOT NULL,
	`loan_provider` text DEFAULT 'Tunai / Tiada' NOT NULL,
	`loan_status` text DEFAULT 'pending' NOT NULL,
	`is_contract_signed` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'locked' NOT NULL,
	`salesperson_id` text,
	`locked_at` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bike_locks_booking_no_unique` ON `bike_locks` (`booking_no`);--> statement-breakpoint
CREATE TABLE `warranty_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_code` text NOT NULL,
	`work_order_id` text,
	`plate_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`complaint` text NOT NULL,
	`mechanic_in_charge` text NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`part_replaced` text,
	`resolution_notes` text,
	`created_at` text NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `warranty_issues_issue_code_unique` ON `warranty_issues` (`issue_code`);--> statement-breakpoint
CREATE TABLE `cash_closings` (
	`id` text PRIMARY KEY NOT NULL,
	`z_report_number` text NOT NULL,
	`closing_date` text NOT NULL,
	`cashier_id` text,
	`opening_float` real DEFAULT 200 NOT NULL,
	`system_expected_cash` real DEFAULT 0 NOT NULL,
	`physical_cash_counted` real DEFAULT 0 NOT NULL,
	`variance` real DEFAULT 0 NOT NULL,
	`petty_cash_total` real DEFAULT 0 NOT NULL,
	`is_balanced` integer DEFAULT true NOT NULL,
	`notes` text,
	`closed_at` text NOT NULL,
	FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cash_closings_z_report_number_unique` ON `cash_closings` (`z_report_number`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_phone` text NOT NULL,
	`work_order_id` text,
	`sender` text DEFAULT 'workshop' NOT NULL,
	`message` text NOT NULL,
	`message_type` text DEFAULT 'text' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
