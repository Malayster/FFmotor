import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { products } from "./products";

export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  contactPerson: text("contact_person"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  termsDays: integer("terms_days").default(30),
  createdAt: text("created_at").notNull(),
});

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  status: text("status", { enum: ["draft", "ordered", "received", "cancelled"] }).notNull().default("draft"),
  totalAmount: real("total_amount").notNull().default(0),
  orderedAt: text("ordered_at"),
  receivedAt: text("received_at"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const purchaseOrderItems = sqliteTable("purchase_order_items", {
  id: text("id").primaryKey(),
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrders.id),
  productId: text("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  costPrice: real("cost_price").notNull().default(0),
  totalPrice: real("total_price").notNull().default(0),
});

