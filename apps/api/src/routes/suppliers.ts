import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { suppliers, purchaseOrders, purchaseOrderItems, products } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const suppliersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai pembekal alat ganti
suppliersRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt)).all();
  return c.json({ success: true, suppliers: list });
});

// Daftar pembekal baharu
suppliersRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = nanoid();
  const code = body.code || `SUP-${Math.floor(100 + Math.random() * 900)}`;

  const supplierData = {
    id,
    name: body.name,
    code,
    contactPerson: body.contactPerson || "",
    phone: body.phone,
    email: body.email || "",
    address: body.address || "",
    termsDays: Number(body.termsDays || 30),
    createdAt: new Date().toISOString(),
  };

  await db.insert(suppliers).values(supplierData).run();
  return c.json({ success: true, supplier: supplierData });
});

// Senarai Purchase Orders (PO)
suppliersRouter.get("/orders", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db
    .select({
      id: purchaseOrders.id,
      poNumber: purchaseOrders.poNumber,
      supplierId: purchaseOrders.supplierId,
      status: purchaseOrders.status,
      totalAmount: purchaseOrders.totalAmount,
      orderedAt: purchaseOrders.orderedAt,
      receivedAt: purchaseOrders.receivedAt,
      notes: purchaseOrders.notes,
      createdAt: purchaseOrders.createdAt,
      supplierName: suppliers.name,
      supplierCode: suppliers.code,
    })
    .from(purchaseOrders)
    .innerJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
    .orderBy(desc(purchaseOrders.createdAt))
    .all();

  return c.json({ success: true, orders: list });
});

// Bina Purchase Order (PO) baharu
suppliersRouter.post("/orders", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = nanoid();
  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let totalAmount = 0;
  if (Array.isArray(body.items)) {
    totalAmount = body.items.reduce(
      (acc: number, curr: any) => acc + Number(curr.quantity || 1) * Number(curr.costPrice || 0),
      0
    );
  }

  const orderData = {
    id,
    poNumber,
    supplierId: body.supplierId,
    status: "ordered" as const,
    totalAmount,
    orderedAt: new Date().toISOString(),
    notes: body.notes || "Pesanan stok minima",
    createdAt: new Date().toISOString(),
  };

  await db.insert(purchaseOrders).values(orderData).run();

  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      await db.insert(purchaseOrderItems).values({
        id: nanoid(),
        purchaseOrderId: id,
        productId: item.productId || null,
        productName: item.productName,
        quantity: Number(item.quantity || 1),
        costPrice: Number(item.costPrice || 0),
        totalPrice: Number(item.quantity || 1) * Number(item.costPrice || 0),
      }).run();
    }
  }

  return c.json({ success: true, order: orderData });
});

// Terima Stok (GRN) & Auto Tambah Kuantiti Stok Rak
suppliersRouter.post("/orders/:id/receive", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  const order = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).get();
  if (!order) return c.json({ success: false, message: "Pesanan tidak dijumpai" }, 404);

  const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id)).all();

  // Kemas kini status PO
  await db.update(purchaseOrders)
    .set({ status: "received", receivedAt: new Date().toISOString() })
    .where(eq(purchaseOrders.id, id))
    .run();

  // Tambah baki stok dalam jadual products
  for (const item of items) {
    if (item.productId) {
      const prod = await db.select().from(products).where(eq(products.id, item.productId)).get();
      if (prod) {
        await db.update(products)
          .set({
            stockQty: prod.stockQty + item.quantity,
            costPrice: item.costPrice, // Kemas kini harga kos terkini
            updatedAt: new Date().toISOString(),
          })
          .where(eq(products.id, item.productId))
          .run();
      }
    }
  }

  return c.json({
    success: true,
    message: `Stok PO ${order.poNumber} berjaya diterima dan baki rak dikemas kini secara automatik.`,
  });
});

