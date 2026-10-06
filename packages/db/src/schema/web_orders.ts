import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const webOrders = sqliteTable("web_orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address"),
  fulfillment: text("fulfillment", { enum: ["pickup", "delivery"] }).notNull(),
  status: text("status", { enum: ["menunggu_semakan", "ditolak", "sudah_bayar", "dihantar", "diserahkan"] }).notNull().default("menunggu_semakan"),
  paymentNote: text("payment_note"),
  trackingNumber: text("tracking_number"),
  rejectReason: text("reject_reason"),
  handledBy: text("handled_by"),
  createdAt: text("created_at").notNull(),
  paidAt: text("paid_at"),
  closedAt: text("closed_at"),
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
