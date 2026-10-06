import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const webOrders = sqliteTable("web_orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  address: text("address"),
  items: text("items"),
  amount: real("amount").default(0),
  fulfillment: text("fulfillment", { enum: ["pickup", "delivery"] }).notNull(),
  status: text("status", { enum: ["menunggu_semakan", "sudah_bayar", "ditolak", "dihantar", "diserahkan"] }).notNull().default("menunggu_semakan"),
  paymentNote: text("payment_note"),
  rejectReason: text("reject_reason"),
  trackingNumber: text("tracking_number"),
  trackingHistory: text("tracking_history"),
  handledBy: text("handled_by"),
  paidAt: text("paid_at"),
  closedAt: text("closed_at"),
  receiptSentAt: text("receipt_sent_at"),
  receiptMethod: text("receipt_method", { enum: ["wasap", "email"] }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
});

export const webOrderLines = sqliteTable("web_order_lines", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  subjectType: text("subject_type", { enum: ["motorcycle", "product"] }).notNull(),
  subjectId: text("subject_id").notNull(),
  title: text("title").notNull(),
  unitPrice: real("unit_price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  videoUrl: text("video_url"),
});
