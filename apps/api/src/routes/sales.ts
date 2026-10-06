import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { motorcycles, motorSales, vehicles } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const salesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai motosikal dalam showroom
salesRouter.get("/motorcycles", async (c) => {
  const db = createDb(c.env.DB);
  const status = c.req.query("status");

  let list = await db.select().from(motorcycles).orderBy(desc(motorcycles.createdAt)).all();
  if (status && status !== "all") {
    list = list.filter((m) => m.status === status);
  }

  return c.json({ success: true, motorcycles: list });
});

// Tambah stok motosikal baharu / trade-in
salesRouter.post("/motorcycles", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { brand, model, year, color, engineNo, chassisNo, condition, currentMileage, costPrice, sellingPrice, notes } = body;

  if (!brand || !model || !engineNo || !chassisNo) {
    return c.json({ success: false, message: "Jenama, model, no enjin & chasis diperlukan" }, 400);
  }

  const now = new Date().toISOString();
  const newBike = {
    id: `moto_${nanoid(8)}`,
    brand,
    model,
    year: year ? parseInt(year) : new Date().getFullYear(),
    color: color || "Hitam",
    engineNo: engineNo.toUpperCase().trim(),
    chassisNo: chassisNo.toUpperCase().trim(),
    condition: (condition || "new") as "new" | "used",
    currentMileage: currentMileage ? parseInt(currentMileage) : 0,
    costPrice: costPrice ? parseFloat(costPrice) : 0,
    sellingPrice: sellingPrice ? parseFloat(sellingPrice) : 0,
    status: "available" as const,
    notes: notes || null,
    createdAt: now,
  };

  await db.insert(motorcycles).values(newBike);
  return c.json({ success: true, motorcycle: newBike }, 201);
});

// Kemaskini maklumat motosikal (Harga Jualan, Harga Kos, Nota, Warna, Status)
const updateMotorcycleHandler = async (c: any) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const bikeList = await db.select().from(motorcycles).where(eq(motorcycles.id, id)).all();
  const bike = bikeList[0];
  if (!bike) return c.json({ success: false, message: "Motosikal tidak dijumpai" }, 404);

  const updateData: any = {};
  if (body.sellingPrice !== undefined) updateData.sellingPrice = parseFloat(body.sellingPrice) || 0;
  if (body.costPrice !== undefined) updateData.costPrice = parseFloat(body.costPrice) || 0;
  if (body.color !== undefined) updateData.color = body.color;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.status !== undefined) updateData.status = body.status;

  await db.update(motorcycles).set(updateData).where(eq(motorcycles.id, id));

  return c.json({ success: true, message: "Maklumat motosikal berjaya dikemaskini" });
};

salesRouter.patch("/motorcycles/:id", updateMotorcycleHandler);
salesRouter.put("/motorcycles/:id", updateMotorcycleHandler);


// Rekod Jualan Motosikal
salesRouter.post("/sell", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { motorcycleId, customerName, customerPhone, customerIc, paymentType, salePrice, depositPaid, assignedPlateNumber } = body;

  if (!motorcycleId || !customerName || !customerPhone || !salePrice) {
    return c.json({ success: false, message: "Maklumat pembeli dan harga jualan diperlukan" }, 400);
  }

  const bikeList = await db.select().from(motorcycles).where(eq(motorcycles.id, motorcycleId)).all();
  const bike = bikeList[0];
  if (!bike) return c.json({ success: false, message: "Motosikal tidak dijumpai" }, 404);

  const now = new Date().toISOString();

  // 1. Rekod jualan
  const saleId = `sale_${nanoid(8)}`;
  await db.insert(motorSales).values({
    id: saleId,
    motorcycleId,
    salespersonId: null,
    customerName,
    customerPhone,
    customerIc: customerIc || "000000-00-0000",
    paymentType: paymentType || "cash",
    salePrice: parseFloat(salePrice),
    depositPaid: depositPaid ? parseFloat(depositPaid) : 0,
    assignedPlateNumber: assignedPlateNumber || null,
    status: "delivered",
    soldAt: now,
  });

  // 2. Kemaskini status motosikal kepada 'sold'
  await db.update(motorcycles).set({ status: "sold" }).where(eq(motorcycles.id, motorcycleId));

  // 3. THE GOLDEN FLOW: Auto-masukkan ke database kenderaan (vehicles) untuk servis masa hadapan!
  if (assignedPlateNumber) {
    const plateNorm = assignedPlateNumber.toUpperCase().replace(/\s+/g, "");
    const existingVeh = await db.select().from(vehicles).where(eq(vehicles.plateNormalized, plateNorm)).all();
    if (existingVeh.length === 0) {
      await db.insert(vehicles).values({
        id: `veh_${nanoid(8)}`,
        plateNumber: assignedPlateNumber.toUpperCase().trim(),
        plateNormalized: plateNorm,
        brand: bike.brand,
        model: bike.model,
        year: bike.year,
        engineNo: bike.engineNo,
        chassisNo: bike.chassisNo,
        ownerName: customerName,
        ownerPhone: customerPhone,
        currentMileage: bike.currentMileage || 0,
        lastServiceMileage: bike.currentMileage || 0,
        lastServiceDate: now.split("T")[0],
        dailyKmAvg: 35.0,
        healthScore: 100, // Motor baharu keluar kedai Skor 100!
        passportToken: `pass_${nanoid(10)}`,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return c.json({ success: true, message: "Jualan motor berjaya direkodkan dan profil kenderaan telah dicipta secara automatik!" });
});

