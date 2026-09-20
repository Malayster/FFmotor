import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { workOrders, workOrderItems, vehicles, products } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const workOrdersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Dapatkan senarai work order
workOrdersRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const status = c.req.query("status");

  let query = db.select({
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
    paymentStatus: workOrders.paymentStatus,
    createdAt: workOrders.createdAt,
    plateNumber: vehicles.plateNumber,
    brand: vehicles.brand,
    model: vehicles.model,
    ownerName: vehicles.ownerName,
    ownerPhone: vehicles.ownerPhone,
  })
  .from(workOrders)
  .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id));

  const list = await query.orderBy(desc(workOrders.createdAt)).all();

  if (status && status !== "all") {
    return c.json({ success: true, workOrders: list.filter(item => item.status === status) });
  }

  return c.json({ success: true, workOrders: list });
});

// Maklumat terperinci satu work order + items
workOrdersRouter.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

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
      totalPartsAmount: workOrders.totalPartsAmount,
      totalLaborAmount: workOrders.totalLaborAmount,
      grandTotal: workOrders.grandTotal,
      paymentStatus: workOrders.paymentStatus,
      createdAt: workOrders.createdAt,
      vehicleId: vehicles.id,
      plateNumber: vehicles.plateNumber,
      brand: vehicles.brand,
      model: vehicles.model,
      ownerName: vehicles.ownerName,
      ownerPhone: vehicles.ownerPhone,
    })
    .from(workOrders)
    .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
    .where(eq(workOrders.id, id))
    .all();

  const wo = woList[0];
  if (!wo) {
    return c.json({ success: false, message: "Work order tidak wujud" }, 404);
  }

  const items = await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.workOrderId, id))
    .all();

  return c.json({
    success: true,
    workOrder: wo,
    items,
  });
});

// Buka Work Order Baharu
workOrdersRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { vehicleId, mechanicId, mileageIn, customerComplaint } = body;

  if (!vehicleId || !customerComplaint) {
    return c.json({ success: false, message: "Kenderaan dan aduan kerosakan diperlukan" }, 400);
  }

  // Cari bilangan WO untuk running number
  const allWO = await db.select().from(workOrders).all();
  const runningIndex = allWO.length + 1;
  const woNumber = `WO-${new Date().getFullYear()}-${String(runningIndex).padStart(4, "0")}`;
  const now = new Date().toISOString();

  const newWO = {
    id: `wo_${nanoid(8)}`,
    woNumber,
    vehicleId,
    mechanicId: mechanicId || null,
    status: "pending" as const,
    mileageIn: mileageIn ? parseInt(mileageIn) : 0,
    customerComplaint,
    mechanicNotes: null,
    videoProofKey: null,
    videoDescription: null,
    approvalToken: `tok_${nanoid(12)}`,
    isApprovedByCustomer: null,
    customerApprovedAt: null,
    totalPartsAmount: 0,
    totalLaborAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
    paymentStatus: "unpaid" as const,
    paymentMethod: null,
    createdAt: now,
    completedAt: null,
  };

  await db.insert(workOrders).values(newWO);

  // Update perbatuan semasa kenderaan jika diberi
  if (mileageIn) {
    await db
      .update(vehicles)
      .set({
        currentMileage: parseInt(mileageIn),
        updatedAt: now,
      })
      .where(eq(vehicles.id, vehicleId));
  }

  return c.json({ success: true, workOrder: newWO }, 201);
});

// Kemaskini Status Work Order
workOrdersRouter.patch("/:id/status", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status, mechanicNotes } = body;

  const validStatuses = ["pending", "inspecting", "in_progress", "waiting_approval", "waiting_parts", "ready", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return c.json({ success: false, message: "Status tidak sah" }, 400);
  }

  const now = new Date().toISOString();
  await db
    .update(workOrders)
    .set({
      status,
      mechanicNotes: mechanicNotes !== undefined ? mechanicNotes : undefined,
      completedAt: status === "completed" ? now : undefined,
    })
    .where(eq(workOrders.id, id));

  return c.json({ success: true, message: `Status dikemaskini kepada ${status}` });
});

// Ciri 2: Lampirkan Video Bukti 5s (Transparent Video Jobcard)
workOrdersRouter.post("/:id/video-proof", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { videoUrl, description } = body;

  if (!videoUrl) {
    return c.json({ success: false, message: "URL video bukti diperlukan" }, 400);
  }

  await db
    .update(workOrders)
    .set({
      videoProofKey: videoUrl,
      videoDescription: description || "Pemeriksaan kerosakan komponen oleh mekanik.",
      status: "waiting_approval", // auto alih ke status menunggu kelulusan pelanggan
    })
    .where(eq(workOrders.id, id));

  return c.json({
    success: true,
    message: "Video bukti berjaya dilampirkan & status ditukar kepada Menunggu Kelulusan",
  });
});

// Tambah Item (Alat Ganti atau Upah Mekanik)
workOrdersRouter.post("/:id/items", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { itemType, productId, description, quantity, unitPrice, isRequiresApproval } = body;

  const qty = quantity ? parseInt(quantity) : 1;
  const price = unitPrice ? parseFloat(unitPrice) : 0;
  const totalPrice = qty * price;
  const now = new Date().toISOString();

  const newItem = {
    id: `woi_${nanoid(8)}`,
    workOrderId: id,
    itemType: itemType as "part" | "labor",
    productId: productId || null,
    description,
    quantity: qty,
    unitPrice: price,
    totalPrice,
    isRequiresApproval: Boolean(isRequiresApproval),
    isApproved: !isRequiresApproval, // jika perlukan approval, default false
    installedSerialId: null,
    createdAt: now,
  };

  await db.insert(workOrderItems).values(newItem);

  // Jika item adalah part dan tidak perlukan approval serta ada productId, tolak stok
  if (itemType === "part" && productId && !isRequiresApproval) {
    const prodList = await db.select().from(products).where(eq(products.id, productId)).all();
    if (prodList[0]) {
      const newStock = Math.max(0, prodList[0].stockQty - qty);
      await db.update(products).set({ stockQty: newStock, updatedAt: now }).where(eq(products.id, productId));
    }
  }

  // Kira semula jumlah keseluruhan WO
  const allItems = await db.select().from(workOrderItems).where(eq(workOrderItems.workOrderId, id)).all();
  let partsTotal = 0;
  let laborTotal = 0;
  for (const item of allItems) {
    if (item.itemType === "part") partsTotal += item.totalPrice;
    if (item.itemType === "labor") laborTotal += item.totalPrice;
  }

  await db
    .update(workOrders)
    .set({
      totalPartsAmount: partsTotal,
      totalLaborAmount: laborTotal,
      grandTotal: partsTotal + laborTotal,
    })
    .where(eq(workOrders.id, id));

  return c.json({ success: true, item: newItem }, 201);
});

// Selesaikan Bayaran (POS Checkout Work Order)
workOrdersRouter.post("/:id/pay", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { paymentMethod } = body;

  const now = new Date().toISOString();
  await db
    .update(workOrders)
    .set({
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: paymentMethod || "Cash",
      completedAt: now,
    })
    .where(eq(workOrders.id, id));

  return c.json({ success: true, message: "Bayaran berjaya direkodkan dan kerja diselesaikan" });
});

