CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'mechanic' NOT NULL,
	`phone` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`plate_number` text NOT NULL,
	`plate_normalized` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer,
	`engine_no` text,
	`chassis_no` text,
	`owner_name` text NOT NULL,
	`owner_phone` text NOT NULL,
	`current_mileage` integer DEFAULT 0 NOT NULL,
	`last_service_mileage` integer DEFAULT 0,
	`last_service_date` text,
	`daily_km_avg` real DEFAULT 35,
	`health_score` integer DEFAULT 100 NOT NULL,
	`passport_token` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_plate_number_unique` ON `vehicles` (`plate_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_plate_normalized_unique` ON `vehicles` (`plate_normalized`);--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_passport_token_unique` ON `vehicles` (`passport_token`);--> statement-breakpoint
CREATE TABLE `product_serials` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`serial_number` text NOT NULL,
	`batch_no` text,
	`supplier_name` text DEFAULT 'Pengedar Rasmi Sah',
	`status` text DEFAULT 'in_stock' NOT NULL,
	`scanned_count` integer DEFAULT 0 NOT NULL,
	`last_scanned_at` text,
	`installed_work_order_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_serials_serial_number_unique` ON `product_serials` (`serial_number`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`barcode` text,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`brand` text NOT NULL,
	`cost_price` real DEFAULT 0 NOT NULL,
	`selling_price` real DEFAULT 0 NOT NULL,
	`stock_qty` integer DEFAULT 0 NOT NULL,
	`min_alert_qty` integer DEFAULT 5 NOT NULL,
	`rack_location` text DEFAULT 'RAK-A1' NOT NULL,
	`is_high_value` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_unique` ON `products` (`barcode`);--> statement-breakpoint
CREATE TABLE `work_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`item_type` text NOT NULL,
	`product_id` text,
	`description` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`total_price` real DEFAULT 0 NOT NULL,
	`is_requires_approval` integer DEFAULT false NOT NULL,
	`is_approved` integer DEFAULT true NOT NULL,
	`installed_serial_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`wo_number` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`mechanic_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`mileage_in` integer DEFAULT 0 NOT NULL,
	`customer_complaint` text NOT NULL,
	`mechanic_notes` text,
	`video_proof_key` text,
	`video_description` text,
	`approval_token` text NOT NULL,
	`is_approved_by_customer` integer,
	`customer_approved_at` text,
	`total_parts_amount` real DEFAULT 0 NOT NULL,
	`total_labor_amount` real DEFAULT 0 NOT NULL,
	`discount_amount` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`payment_method` text,
	`created_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mechanic_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_orders_wo_number_unique` ON `work_orders` (`wo_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `work_orders_approval_token_unique` ON `work_orders` (`approval_token`);--> statement-breakpoint
CREATE TABLE `motor_sales` (
	`id` text PRIMARY KEY NOT NULL,
	`motorcycle_id` text NOT NULL,
	`salesperson_id` text,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_ic` text NOT NULL,
	`payment_type` text NOT NULL,
	`sale_price` real NOT NULL,
	`deposit_paid` real DEFAULT 0,
	`assigned_plate_number` text,
	`status` text DEFAULT 'pending_jpj' NOT NULL,
	`sold_at` text NOT NULL,
	FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`salesperson_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `motorcycles` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`color` text NOT NULL,
	`engine_no` text NOT NULL,
	`chassis_no` text NOT NULL,
	`condition` text DEFAULT 'new' NOT NULL,
	`current_mileage` integer DEFAULT 0,
	`cost_price` real DEFAULT 0 NOT NULL,
	`selling_price` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `motorcycles_engine_no_unique` ON `motorcycles` (`engine_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `motorcycles_chassis_no_unique` ON `motorcycles` (`chassis_no`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`type` text DEFAULT 'bike_purchase' NOT NULL,
	`target_item` text NOT NULL,
	`budget` real,
	`status` text DEFAULT 'new' NOT NULL,
	`assigned_to` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `predictive_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`component_type` text NOT NULL,
	`estimated_mileage_due` integer NOT NULL,
	`predicted_service_date` text NOT NULL,
	`reserved_product_id` text,
	`status` text DEFAULT 'forecasted' NOT NULL,
	`whatsapp_message_content` text,
	`notified_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reserved_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
