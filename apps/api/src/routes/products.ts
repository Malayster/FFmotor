import { Hono } from "hono";
import { eq, desc, like } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { products, productSerials } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const productsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai produk & carian
productsRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const q = c.req.query("q")?.toLowerCase();
  const category = c.req.query("category");

  let list = await db.select().from(products).orderBy(products.category, products.name).all();

  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }

  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        p.rackLocation.toLowerCase().includes(q)
    );
  }

  return c.json({ success: true, products: list });
});

// Tambah produk baharu
productsRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { sku, barcode, name, category, brand, costPrice, sellingPrice, stockQty, minAlertQty, rackLocation, isHighValue } = body;

  if (!sku || !name || !category) {
    return c.json({ success: false, message: "SKU, Nama dan Kategori diperlukan" }, 400);
  }

  const now = new Date().toISOString();
  const newProduct = {
    id: `prod_${nanoid(8)}`,
    sku: sku.toUpperCase().trim(),
    barcode: barcode || null,
    name,
    category,
    brand: brand || "Generik",
    costPrice: costPrice ? parseFloat(costPrice) : 0,
    sellingPrice: sellingPrice ? parseFloat(sellingPrice) : 0,
    stockQty: stockQty ? parseInt(stockQty) : 0,
    minAlertQty: minAlertQty ? parseInt(minAlertQty) : 5,
    rackLocation: rackLocation || "RAK-A1",
    isHighValue: Boolean(isHighValue),
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(products).values(newProduct);
  return c.json({ success: true, product: newProduct }, 201);
});

// Kemaskini stok masuk / laras stok
productsRouter.post("/:id/adjust-stock", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { delta, rackLocation } = body;

  const prodList = await db.select().from(products).where(eq(products.id, id)).all();
  const prod = prodList[0];
  if (!prod) return c.json({ success: false, message: "Produk tidak dijumpai" }, 404);

  const newQty = Math.max(0, prod.stockQty + parseInt(delta || 0));
  const now = new Date().toISOString();

  await db
    .update(products)
    .set({
      stockQty: newQty,
      rackLocation: rackLocation || prod.rackLocation,
      updatedAt: now,
    })
    .where(eq(products.id, id));

  return c.json({ success: true, stockQty: newQty });
});

// Daftar kod siri keaslian untuk produk tertentu
productsRouter.post("/:id/serials", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { serialNumber, batchNo, supplierName } = body;

  if (!serialNumber) {
    return c.json({ success: false, message: "Kod siri diperlukan" }, 400);
  }

  const cleanSerial = serialNumber.toUpperCase().trim();
  const existing = await db.select().from(productSerials).where(eq(productSerials.serialNumber, cleanSerial)).all();
  if (existing.length > 0) {
    return c.json({ success: false, message: "Kod siri ini sudah wujud dalam pangkalan data!" }, 400);
  }

  const now = new Date().toISOString();
  const newSerial = {
    id: `ser_${nanoid(8)}`,
    productId: id,
    serialNumber: cleanSerial,
    batchNo: batchNo || "BATCH-2026",
    supplierName: supplierName || "Pengedar Sah Rasmi",
    status: "in_stock" as const,
    scannedCount: 0,
    lastScannedAt: null,
    installedWorkOrderId: null,
    createdAt: now,
  };

  await db.insert(productSerials).values(newSerial);

  return c.json({ success: true, serial: newSerial }, 201);
});
