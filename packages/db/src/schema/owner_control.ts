import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { motorcycles } from "./sales";
import { products } from "./products";

export const unitHolds = sqliteTable("unit_holds", {
  id: text("id").primaryKey(),
  motorcycleId: text("motorcycle_id").notNull().references(() => motorcycles.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  kind: text("kind", { enum: ["soft_15m", "deposit_48h"] }).notNull(),
  status: text("status", { enum: ["active", "matched", "rejected", "expired"] }).notNull().default("active"),
  amount: real("amount").notNull().default(0),
  slipRef: text("slip_ref"),
  slipImage: text("slip_image"),
  affiliateCode: text("affiliate_code"),
  quotedPrice: real("quoted_price").notNull(),
  quoteExpiresAt: text("quote_expires_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const partOrders = sqliteTable("part_orders", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  fulfillment: text("fulfillment", { enum: ["pickup", "delivery"] }).notNull(),
  shippingCost: real("shipping_cost").notNull().default(0),
  status: text("status", { enum: ["pending_match", "held", "rejected", "shipped", "collected"] }).notNull().default("pending_match"),
  slipRef: text("slip_ref"),
  trackingNumber: text("tracking_number"),
  createdAt: text("created_at").notNull(),
});

export const serviceSlots = sqliteTable("service_slots", {
  id: text("id").primaryKey(),
  bay: integer("bay").notNull(),
  slotDate: text("slot_date").notNull(),
  slotTime: text("slot_time").notNull(),
  plate: text("plate").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceType: text("service_type").notNull(),
  status: text("status", { enum: ["booked", "cancelled"] }).notNull().default("booked"),
  workOrderId: text("work_order_id"),
  createdAt: text("created_at").notNull(),
});

export const priceChanges = sqliteTable("price_changes", {
  id: text("id").primaryKey(),
  motorcycleId: text("motorcycle_id").notNull().references(() => motorcycles.id),
  oldPrice: real("old_price").notNull(),
  newPrice: real("new_price").notNull(),
  belowCost: integer("below_cost", { mode: "boolean" }).notNull().default(false),
  changedBy: text("changed_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const distributorClaims = sqliteTable("distributor_claims", {
  id: text("id").primaryKey(),
  distributor: text("distributor").notNull(),
  motorcycleId: text("motorcycle_id"),
  amount: real("amount").notNull(),
  status: text("status", { enum: ["accrued", "received"] }).notNull().default("accrued"),
  note: text("note"),
  createdAt: text("created_at").notNull(),
  receivedAt: text("received_at"),
});

export const arahan = sqliteTable("arahan", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  targetRole: text("target_role").notNull(),
  status: text("status", { enum: ["open", "done"] }).notNull().default("open"),
  createdBy: text("created_by").notNull(),
  source: text("source").notNull().default("manual"),
  createdAt: text("created_at").notNull(),
  doneAt: text("done_at"),
});
