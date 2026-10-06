import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { leads, predictiveBookings, vehicles, products } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const leadsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai Lead Sales
leadsRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const status = c.req.query("status");

  let list = await db.select().from(leads).orderBy(desc(leads.createdAt)).all();
  if (status && status !== "all") {
    list = list.filter((l) => l.status === status);
  }

  return c.json({ success: true, leads: list });
});

// Tambah Lead Baharu
leadsRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { customerName, customerPhone, type, targetItem, budget, notes } = body;

  if (!customerName || !customerPhone || !targetItem) {
    return c.json({ success: false, message: "Nama, telefon dan sasaran item diperlukan" }, 400);
  }

  const now = new Date().toISOString();
  const newLead = {
    id: `lead_${nanoid(8)}`,
    customerName,
    customerPhone,
    type: (type || "bike_purchase") as "bike_purchase" | "service_maintenance" | "parts_hunting",
    targetItem,
    budget: budget ? parseFloat(budget) : null,
    status: "new" as const,
    assignedTo: null,
    notes: notes || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(leads).values(newLead);
  return c.json({ success: true, lead: newLead }, 201);
});

// Kemaskini Status Lead
const updateLeadHandler = async (c: any) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status, notes } = body;

  const now = new Date().toISOString();
  const updateData: any = { updatedAt: now };
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  await db
    .update(leads)
    .set(updateData)
    .where(eq(leads.id, id));

  return c.json({ success: true, message: "Status prospek berjaya dikemaskini" });
};

leadsRouter.patch("/:id/status", updateLeadHandler);
leadsRouter.patch("/:id", updateLeadHandler);
leadsRouter.put("/:id", updateLeadHandler);

// Ciri 3: Predictive Parts Booking (Senarai ramalan & tempahan automatik)
leadsRouter.get("/predictive-forecasts", async (c) => {
  const db = createDb(c.env.DB);

  const list = await db
    .select({
      id: predictiveBookings.id,
      componentType: predictiveBookings.componentType,
      estimatedMileageDue: predictiveBookings.estimatedMileageDue,
      predictedServiceDate: predictiveBookings.predictedServiceDate,
      status: predictiveBookings.status,
      whatsappMessageContent: predictiveBookings.whatsappMessageContent,
      createdAt: predictiveBookings.createdAt,
      plateNumber: vehicles.plateNumber,
      brand: vehicles.brand,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
      ownerPhone: vehicles.ownerPhone,
      currentMileage: vehicles.currentMileage,
      dailyKmAvg: vehicles.dailyKmAvg,
      reservedProductName: products.name,
      reservedProductStock: products.stockQty,
      reservedProductRack: products.rackLocation,
    })
    .from(predictiveBookings)
    .innerJoin(vehicles, eq(predictiveBookings.vehicleId, vehicles.id))
    .leftJoin(products, eq(predictiveBookings.reservedProductId, products.id))
    .orderBy(predictiveBookings.predictedServiceDate)
    .all();

  return c.json({ success: true, forecasts: list, data: list });
});

