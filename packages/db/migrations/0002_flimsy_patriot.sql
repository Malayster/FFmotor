CREATE TABLE `purchase_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_order_id` text NOT NULL,
	`product_id` text,
	`product_name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`cost_price` real DEFAULT 0 NOT NULL,
	`total_price` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`po_number` text NOT NULL,
	`supplier_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`ordered_at` text,
	`received_at` text,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_orders_po_number_unique` ON `purchase_orders` (`po_number`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`contact_person` text,
	`phone` text NOT NULL,
	`email` text,
	`address` text,
	`terms_days` integer DEFAULT 30,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_code_unique` ON `suppliers` (`code`);--> statement-breakpoint
CREATE TABLE `mechanic_commissions` (
	`id` text PRIMARY KEY NOT NULL,
	`mechanic_id` text NOT NULL,
	`work_order_id` text NOT NULL,
	`work_order_number` text NOT NULL,
	`plate_number` text NOT NULL,
	`labor_total` real DEFAULT 0 NOT NULL,
	`commission_percent` real DEFAULT 15 NOT NULL,
	`commission_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'accrued' NOT NULL,
	`created_at` text NOT NULL,
	`paid_at` text,
	FOREIGN KEY (`mechanic_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `staff_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`specialty` text DEFAULT 'Servis Umum & CVT',
	`basic_salary` real DEFAULT 1800,
	`commission_rate` real DEFAULT 15,
	`active_bay` integer,
	`rating` real DEFAULT 5,
	`total_jobs_done` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_profiles_user_id_unique` ON `staff_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `loan_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`app_number` text NOT NULL,
	`motorcycle_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_ic` text NOT NULL,
	`salary_monthly` real DEFAULT 0 NOT NULL,
	`deposit_amount` real DEFAULT 0 NOT NULL,
	`loan_amount` real DEFAULT 0 NOT NULL,
	`loan_term_months` integer DEFAULT 36 NOT NULL,
	`monthly_installment` real DEFAULT 0 NOT NULL,
	`loan_provider` text DEFAULT 'AEON Credit Service' NOT NULL,
	`stage` text DEFAULT 'prospect' NOT NULL,
	`salesperson_id` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loan_applications_app_number_unique` ON `loan_applications` (`app_number`);