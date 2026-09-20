import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode").unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Minyak, Tayar, Brake, Belt CVT, Enjin, Aksesori
  brand: text("brand").notNull(), // Yamalube, Honda Genuine, Michelin, Uma Racing
  costPrice: real("cost_price").notNull().default(0),
  sellingPrice: real("selling_price").notNull().default(0),
  stockQty: integer("stock_qty").notNull().default(0),
  minAlertQty: integer("min_alert_qty").notNull().default(5),
  rackLocation: text("rack_location").notNull().default("RAK-A1"),
  isHighValue: integer("is_high_value", { mode: "boolean" }).notNull().default(false), // perlukan serial check
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Semak Keaslian Part (Serial Verification)
export const productSerials = sqliteTable("product_serials", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  serialNumber: text("serial_number").notNull().unique(), // Kod siri unik kilang/kedai
  batchNo: text("batch_no"),
  supplierName: text("supplier_name").default("Pengedar Rasmi Sah"),
  status: text("status", { enum: ["in_stock", "allocated", "installed", "sold"] }).notNull().default("in_stock"),
  scannedCount: integer("scanned_count").notNull().default(0),
  lastScannedAt: text("last_scanned_at"),
  installedWorkOrderId: text("installed_work_order_id"),
  createdAt: text("created_at").notNull(),
});

