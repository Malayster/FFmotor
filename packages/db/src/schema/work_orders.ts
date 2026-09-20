import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { vehicles } from "./vehicles";
import { users } from "./users";
import { products } from "./products";

export const workOrders = sqliteTable("work_orders", {
  id: text("id").primaryKey(),
  woNumber: text("wo_number").notNull().unique(), // Contoh: WO-2026-0001
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id),
  mechanicId: text("mechanic_id").references(() => users.id),
  status: text("status", {
    enum: ["pending", "inspecting", "in_progress", "waiting_approval", "waiting_parts", "ready", "completed", "cancelled"]
  }).notNull().default("pending"),
  mileageIn: integer("mileage_in").notNull().default(0),
  customerComplaint: text("customer_complaint").notNull(),
  mechanicNotes: text("mechanic_notes"),
  
  // Ciri 2: Transparent Video Jobcard
  videoProofKey: text("video_proof_key"), // Path di Cloudflare R2
  videoDescription: text("video_description"),
  approvalToken: text("approval_token").notNull().unique(), // Link QR WhatsApp: /track/:token
  isApprovedByCustomer: integer("is_approved_by_customer", { mode: "boolean" }),
  customerApprovedAt: text("customer_approved_at"),

  // Kewangan
  totalPartsAmount: real("total_parts_amount").notNull().default(0),
  totalLaborAmount: real("total_labor_amount").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  grandTotal: real("grand_total").notNull().default(0),
  paymentStatus: text("payment_status", { enum: ["unpaid", "partial", "paid"] }).notNull().default("unpaid"),
  paymentMethod: text("payment_method"), // Cash, DuitNow QR, Card

  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const workOrderItems = sqliteTable("work_order_items", {
  id: text("id").primaryKey(),
  workOrderId: text("work_order_id").notNull().references(() => workOrders.id),
  itemType: text("item_type", { enum: ["part", "labor"] }).notNull(),
  productId: text("product_id").references(() => products.id),
  description: text("description").notNull(), // Nama part atau jenis upah
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull().default(0),
  totalPrice: real("total_price").notNull().default(0),
  isRequiresApproval: integer("is_requires_approval", { mode: "boolean" }).notNull().default(false),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(true),
  installedSerialId: text("installed_serial_id"), // Jika part bernilai tinggi / ori
  createdAt: text("created_at").notNull(),
});

