import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { vehicles } from "./vehicles";
import { products } from "./products";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  type: text("type", { enum: ["bike_purchase", "service_maintenance", "parts_hunting"] }).notNull().default("bike_purchase"),
  targetItem: text("target_item").notNull(), // cth: "Yamaha NVX 155 Standard" atau "Coverset Y15 V2 Movistar"
  budget: real("budget"),
  status: text("status", { enum: ["new", "contacted", "test_ride", "loan_submitted", "won", "lost"] }).notNull().default("new"),
  assignedTo: text("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Ciri 3: Predictive Parts Booking (Kiraan Ramalan Mileage Harian oleh Cron)
export const predictiveBookings = sqliteTable("predictive_bookings", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id),
  componentType: text("component_type", { enum: ["engine_oil", "belting_cvt", "brake_pads", "chain_sprocket", "spark_plug"] }).notNull(),
  estimatedMileageDue: integer("estimated_mileage_due").notNull(),
  predictedServiceDate: text("predicted_service_date").notNull(), // Tarikh diramal tiba
  reservedProductId: text("reserved_product_id").references(() => products.id),
  status: text("status", { enum: ["forecasted", "part_reserved", "whatsapp_sent", "booked", "dismissed"] }).notNull().default("forecasted"),
  whatsappMessageContent: text("whatsapp_message_content"),
  notifiedAt: text("notified_at"),
  createdAt: text("created_at").notNull(),
});

