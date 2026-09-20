import { Hono } from "hono";
import { eq, desc, like } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { vehicles, workOrders } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const vehiclesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Cari kenderaan mengikut no plat atau senarai
vehiclesRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const q = c.req.query("q")?.toUpperCase().replace(/\s+/g, "");

  if (q) {
    const list = await db
      .select()
      .from(vehicles)
      .where(like(vehicles.plateNormalized, `%${q}%`))
      .all();
    return c.json({ success: true, vehicles: list });
  }

  const list = await db.select().from(vehicles).orderBy(desc(vehicles.updatedAt)).all();
  return c.json({ success: true, vehicles: list });
});

// Maklumat spesifik kenderaan + sejarah servis
vehiclesRouter.get("/:plate", async (c) => {
  const db = createDb(c.env.DB);
  const plateNorm = c.req.param("plate").toUpperCase().replace(/\s+/g, "");

  const vehicleList = await db.select().from(vehicles).where(eq(vehicles.plateNormalized, plateNorm)).all();
  const vehicle = vehicleList[0];

  if (!vehicle) {
    return c.json({ success: false, message: "Kenderaan tidak dijumpai" }, 404);
  }

  // Ambil sejarah servis
  const history = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.vehicleId, vehicle.id))
    .orderBy(desc(workOrders.createdAt))
    .all();

  return c.json({
    success: true,
    vehicle,
    history,
  });
});

// Daftar kenderaan baharu
vehiclesRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { plateNumber, brand, model, year, ownerName, ownerPhone, currentMileage, engineNo, chassisNo } = body;

  if (!plateNumber || !brand || !model || !ownerName || !ownerPhone) {
    return c.json({ success: false, message: "Maklumat wajib tidak lengkap" }, 400);
  }

  const plateNorm = plateNumber.toUpperCase().replace(/\s+/g, "");
  const existing = await db.select().from(vehicles).where(eq(vehicles.plateNormalized, plateNorm)).all();
  if (existing.length > 0) {
    return c.json({ success: false, message: "No plat ini sudah berdaftar dalam sistem" }, 400);
  }

  const now = new Date().toISOString();
  const newVehicle = {
    id: `veh_${nanoid(8)}`,
    plateNumber: plateNumber.toUpperCase().trim(),
    plateNormalized: plateNorm,
    brand,
    model,
    year: year ? parseInt(year) : new Date().getFullYear(),
    engineNo: engineNo || null,
    chassisNo: chassisNo || null,
    ownerName,
    ownerPhone,
    currentMileage: currentMileage ? parseInt(currentMileage) : 0,
    lastServiceMileage: currentMileage ? parseInt(currentMileage) : 0,
    lastServiceDate: now.split("T")[0],
    dailyKmAvg: 35.0,
    healthScore: 100,
    passportToken: `pass_${nanoid(10)}`,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(vehicles).values(newVehicle);

  return c.json({ success: true, vehicle: newVehicle }, 201);
});
