import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(), // Contoh: WXY1234
  plateNormalized: text("plate_normalized").notNull().unique(), // WXY1234 (uppercase, no space)
  brand: text("brand").notNull(), // Yamaha, Honda, Modenas, SYM
  model: text("model").notNull(), // Y15ZR, RS-X, NVX155
  year: integer("year"),
  engineNo: text("engine_no"),
  chassisNo: text("chassis_no"),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  currentMileage: integer("current_mileage").notNull().default(0),
  lastServiceMileage: integer("last_service_mileage").default(0),
  lastServiceDate: text("last_service_date"),
  dailyKmAvg: real("daily_km_avg").default(35.0), // anggaran km harian
  // Ciri 1: Digital Motorcycle Passport
  healthScore: integer("health_score").notNull().default(100), // 0 - 100
  passportToken: text("passport_token").notNull().unique(), // token rahsia QR kalis air
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

