import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { workOrders } from "./work_orders";

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  customerPhone: text("customer_phone").notNull(),
  workOrderId: text("work_order_id").references(() => workOrders.id),
  sender: text("sender", { enum: ["workshop", "customer", "system"] }).notNull().default("workshop"),
  message: text("message").notNull(),
  messageType: text("message_type", { enum: ["text", "video_proof", "motor_ready", "predictive_alert"] }).notNull().default("text"),
  createdAt: text("created_at").notNull(),
});

