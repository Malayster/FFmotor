import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const quotations = sqliteTable("quotations", {
  id: text("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  plateNumber: text("plate_number").notNull(),
  bikeModel: text("bike_model").notNull(),
  subtotal: real("subtotal").notNull().default(0),
  discountPercent: real("discount_percent").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  grandTotal: real("grand_total").notNull().default(0),
  requiresDirectorApproval: integer("requires_director_approval", { mode: "boolean" }).notNull().default(false),
  isApprovedByDirector: integer("is_approved_by_director", { mode: "boolean" }).default(false),
  status: text("status", { enum: ["draft", "pending_approval", "sent", "accepted", "converted", "rejected"] }).notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").notNull(),
  validUntil: text("valid_until"),
});

export const quotationItems = sqliteTable("quotation_items", {
  id: text("id").primaryKey(),
  quotationId: text("quotation_id").notNull().references(() => quotations.id),
  description: text("description").notNull(),
  itemType: text("item_type", { enum: ["part", "labor"] }).notNull().default("part"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull().default(0),
  totalPrice: real("total_price").notNull().default(0),
});

