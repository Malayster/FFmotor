import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { vehicles, workOrders, workOrderItems, products } from "@ffmotor/db";
import { Bindings, Variables } from "../types";

export const publicRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Ciri 1: Halaman Awam Digital Motorcycle Passport (/passport/:plate)
publicRouter.get("/passport/:plate", async (c) => {
  const db = createDb(c.env.DB);
  const plateNorm = c.req.param("plate").toUpperCase().replace(/\s+/g, "");

  const vehList = await db.select().from(vehicles).where(eq(vehicles.plateNormalized, plateNorm)).all();
  const vehicle = vehList[0];

  if (!vehicle) {
    return c.json({ success: false, message: "Rekod motosikal ini belum didaftarkan di FFmotor" }, 404);
  }

  // Ambil semua sejarah servis rasmi di FFmotor
  const serviceHistory = await db
    .select({
      id: workOrders.id,
      woNumber: workOrders.woNumber,
      mileageIn: workOrders.mileageIn,
      customerComplaint: workOrders.customerComplaint,
      mechanicNotes: workOrders.mechanicNotes,
      completedAt: workOrders.completedAt,
      grandTotal: workOrders.grandTotal,
    })
    .from(workOrders)
    .where(eq(workOrders.vehicleId, vehicle.id))
    .orderBy(desc(workOrders.completedAt))
    .all();

  // Ambil semua part yang telah dipasang
  const partsInstalled = await db
    .select({
      workOrderId: workOrderItems.workOrderId,
      description: workOrderItems.description,
      itemType: workOrderItems.itemType,
      installedSerialId: workOrderItems.installedSerialId,
      productBrand: products.brand,
    })
    .from(workOrderItems)
    .leftJoin(products, eq(workOrderItems.productId, products.id))
    .all();

  // Kira gred kesihatan
  let grade = "A";
  if (vehicle.healthScore < 70) grade = "C";
  else if (vehicle.healthScore < 85) grade = "B";

  return c.json({
    success: true,
    passport: {
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      currentMileage: vehicle.currentMileage,
      healthScore: vehicle.healthScore,
      grade,
      isVerifiedOriginal: true,
      lastServiceDate: vehicle.lastServiceDate,
      totalServicesDone: serviceHistory.length,
      serviceHistory: serviceHistory.map((s) => ({
        ...s,
        parts: partsInstalled.filter((p) => p.workOrderId === s.id && p.itemType === "part"),
      })),
    },
  });
});

// Ciri 2: Live Tracking Pelanggan Tanpa Login (/track/:token)
publicRouter.get("/wo/:token", async (c) => {
  const db = createDb(c.env.DB);
  const token = c.req.param("token");

  const woList = await db
    .select({
      id: workOrders.id,
      woNumber: workOrders.woNumber,
      status: workOrders.status,
      mileageIn: workOrders.mileageIn,
      customerComplaint: workOrders.customerComplaint,
      mechanicNotes: workOrders.mechanicNotes,
      videoProofKey: workOrders.videoProofKey,
      videoDescription: workOrders.videoDescription,
      approvalToken: workOrders.approvalToken,
      isApprovedByCustomer: workOrders.isApprovedByCustomer,
      grandTotal: workOrders.grandTotal,
      createdAt: workOrders.createdAt,
      plateNumber: vehicles.plateNumber,
      brand: vehicles.brand,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
    })
    .from(workOrders)
    .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
    .where(eq(workOrders.approvalToken, token))
    .all();

  const wo = woList[0];
  if (!wo) {
    return c.json({ success: false, message: "Pautan kerja tidak sah atau telah tamat tempoh" }, 404);
  }

  const items = await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.workOrderId, wo.id))
    .all();

  return c.json({
    success: true,
    workOrder: wo,
    items,
  });
});

// Pelanggan Tekan Butang [Luluskan] atau [Tolak] pada Video Jobcard
publicRouter.post("/wo/:token/decision", async (c) => {
  const db = createDb(c.env.DB);
  const token = c.req.param("token");
  const body = await c.req.json();
  const { approved } = body;

  const woList = await db.select().from(workOrders).where(eq(workOrders.approvalToken, token)).all();
  const wo = woList[0];
  if (!wo) {
    return c.json({ success: false, message: "Pautan tidak sah" }, 404);
  }

  const now = new Date().toISOString();
  const newStatus = approved ? "in_progress" : "in_progress";

  await db
    .update(workOrders)
    .set({
      isApprovedByCustomer: Boolean(approved),
      customerApprovedAt: now,
      status: newStatus,
    })
    .where(eq(workOrders.id, wo.id));

  // Update item status approval
  await db
    .update(workOrderItems)
    .set({
      isApproved: Boolean(approved),
    })
    .where(eq(workOrderItems.workOrderId, wo.id));

  return c.json({
    success: true,
    message: approved
      ? "Terima kasih! Penukaran alat ganti telah diluluskan. Mekanik kami sedang memulakan pemasangan."
      : "Keputusan anda telah direkodkan. Mekanik akan meneruskan kerja tanpa menukar komponen tersebut.",
  });
});

