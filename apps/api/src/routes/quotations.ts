import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { quotations, quotationItems, workOrders, workOrderItems, vehicles } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const quotationsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai sebut harga
quotationsRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db.select().from(quotations).orderBy(desc(quotations.createdAt)).all();
  return c.json({ success: true, quotations: list });
});

// Maklumat satu sebut harga berserta items
quotationsRouter.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  const quote = await db.select().from(quotations).where(eq(quotations.id, id)).get();
  if (!quote) return c.json({ success: false, message: "Sebut harga tidak dijumpai" }, 404);

  const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, id)).all();
  return c.json({ success: true, quotation: { ...quote, items } });
});

// Cipta sebut harga baharu
quotationsRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = nanoid();
  const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const discountPercent = Number(body.discountPercent || 0);
  const requiresDirectorApproval = discountPercent > 10;

  const quoteData = {
    id,
    quoteNumber,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    plateNumber: body.plateNumber.toUpperCase().replace(/\s+/g, ""),
    bikeModel: body.bikeModel,
    subtotal: Number(body.subtotal || 0),
    discountPercent,
    discountAmount: Number(body.discountAmount || 0),
    grandTotal: Number(body.grandTotal || 0),
    requiresDirectorApproval,
    isApprovedByDirector: !requiresDirectorApproval,
    status: requiresDirectorApproval ? "pending_approval" as const : "sent" as const,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await db.insert(quotations).values(quoteData).run();

  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      await db.insert(quotationItems).values({
        id: nanoid(),
        quotationId: id,
        description: item.description,
        itemType: item.type === "labor" ? "labor" : "part",
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.quantity || 1) * Number(item.unitPrice || 0),
      }).run();
    }
  }

  return c.json({ success: true, quotation: quoteData });
});

// Luluskan diskaun oleh Pengarah (SA)
quotationsRouter.post("/:id/approve", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  await db.update(quotations)
    .set({ isApprovedByDirector: true, status: "sent" })
    .where(eq(quotations.id, id))
    .run();

  return c.json({ success: true, message: "Diskaun sebut harga telah diluluskan oleh Pengarah." });
});

// GOLDEN LOOP 1: Tukar Sebut Harga menjadi Kad Kerja (Work Order)
quotationsRouter.post("/:id/convert", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  const quote = await db.select().from(quotations).where(eq(quotations.id, id)).get();
  if (!quote) return c.json({ success: false, message: "Sebut harga tidak dijumpai" }, 404);

  const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, id)).all();

  // Semak atau cipta rekod kenderaan
  let vehicle = await db.select().from(vehicles).where(eq(vehicles.plateNormalized, quote.plateNumber)).get();
  if (!vehicle) {
    const vehId = nanoid();
    await db.insert(vehicles).values({
      id: vehId,
      plateNumber: quote.plateNumber,
      plateNormalized: quote.plateNumber,
      brand: quote.bikeModel.split(" ")[0] || "Motosikal",
      model: quote.bikeModel,
      ownerName: quote.customerName,
      ownerPhone: quote.customerPhone,
      currentMileage: 10000,
      healthScore: 90,
      passportToken: `pass_${nanoid(8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();
    vehicle = await db.select().from(vehicles).where(eq(vehicles.id, vehId)).get();
  }

  // Cipta Work Order
  const woId = nanoid();
  const woNumber = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const approvalToken = `tok_${nanoid(12)}`;

  const totalParts = items.filter(i => i.itemType === "part").reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalLabor = items.filter(i => i.itemType === "labor").reduce((acc, curr) => acc + curr.totalPrice, 0);

  await db.insert(workOrders).values({
    id: woId,
    woNumber,
    vehicleId: vehicle!.id,
    status: "in_progress",
    mileageIn: vehicle!.currentMileage,
    customerComplaint: `Dinaik taraf dari Sebut Harga ${quote.quoteNumber}`,
    approvalToken,
    grandTotal: quote.grandTotal,
    totalPartsAmount: totalParts,
    totalLaborAmount: totalLabor,
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
  }).run();

  // Salin item ke work order items
  for (const item of items) {
    await db.insert(workOrderItems).values({
      id: nanoid(),
      workOrderId: woId,
      itemType: item.itemType,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      isRequiresApproval: false,
      isApproved: true,
      createdAt: new Date().toISOString(),
    }).run();
  }

  // Kemas kini status sebut harga
  await db.update(quotations).set({ status: "converted" }).where(eq(quotations.id, id)).run();

  return c.json({
    success: true,
    message: `Sebut harga ${quote.quoteNumber} berjaya ditukar ke Kad Kerja ${woNumber}!`,
    workOrderId: woId,
    woNumber,
    workOrderNumber: woNumber,
  });
});
