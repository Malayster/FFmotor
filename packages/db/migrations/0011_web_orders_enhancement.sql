-- Migration: 0011_web_orders_enhancement.sql
-- Menambah lajur-lajur rasmi pesanan beg kuning (web_orders)
ALTER TABLE `web_orders` ADD COLUMN `customer_email` text;
ALTER TABLE `web_orders` ADD COLUMN `items` text;
ALTER TABLE `web_orders` ADD COLUMN `amount` real DEFAULT 0;
ALTER TABLE `web_orders` ADD COLUMN `tracking_history` text;
ALTER TABLE `web_orders` ADD COLUMN `receipt_sent_at` text;
ALTER TABLE `web_orders` ADD COLUMN `receipt_method` text;
ALTER TABLE `web_orders` ADD COLUMN `updated_at` text;
