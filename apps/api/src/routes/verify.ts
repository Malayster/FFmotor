import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { productSerials, products, workOrders, vehicles } from "@ffmotor/db";
import { Bindings, Variables } from "../types";

export const verifyRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Semak Keaslian Part Motosikal
verifyRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { code } = body;

  if (!code) {
    return c.json({ success: false, message: "Sila masukkan kod siri atau imbas barcode" }, 400);
  }

  const cleanCode = code.toUpperCase().trim();

  // 1. Cari dalam productSerials (kod siri unik)
  const serialMatch = await db
    .select({
      serialId: productSerials.id,
      serialNumber: productSerials.serialNumber,
      batchNo: productSerials.batchNo,
      supplierName: productSerials.supplierName,
      status: productSerials.status,
      scannedCount: productSerials.scannedCount,
      lastScannedAt: productSerials.lastScannedAt,
      registeredAt: productSerials.createdAt,
      installedWorkOrderId: productSerials.installedWorkOrderId,
      productName: products.name,
      productBrand: products.brand,
      productCategory: products.category,
      sku: products.sku,
    })
    .from(productSerials)
    .innerJoin(products, eq(productSerials.productId, products.id))
    .where(eq(productSerials.serialNumber, cleanCode))
    .all();

  const match = serialMatch[0];

  if (!match) {
    // 2. Semak jika ia sepadan dengan barcode produk am (bukan serial unik)
    const barcodeMatch = await db.select().from(products).where(eq(products.barcode, cleanCode)).all();
    if (barcodeMatch[0]) {
      return c.json({
        success: true,
        verified: true,
        type: "product_barcode",
        message: "Kod bar produk berdaftar dalam katalog FFmotor.",
        product: barcodeMatch[0],
      });
    }

    return c.json({
      success: true,
      verified: false,
      message: "AMARAN: Kod siri atau produk ini TIDAK DITEMUI dalam pangkalan data sah FFmotor. Sila berwaspada terhadap barang tiruan/palsu.",
    });
  }

  // Update scanned count dan timestamp
  const now = new Date().toISOString();
  const newCount = match.scannedCount + 1;
  await db
    .update(productSerials)
    .set({
      scannedCount: newCount,
      lastScannedAt: now,
    })
    .where(eq(productSerials.id, match.serialId));

  // Berikan amaran jika diimbas terlalu kerap (kemungkinan kod dicetak rompak / diklon)
  const isSuspicious = newCount > 5;

  let installedInfo = null;
  if (match.installedWorkOrderId) {
    const woInfo = await db
      .select({
        woNumber: workOrders.woNumber,
        completedAt: workOrders.completedAt,
        plateNumber: vehicles.plateNumber,
        model: vehicles.model,
      })
      .from(workOrders)
      .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
      .where(eq(workOrders.id, match.installedWorkOrderId))
      .all();
    installedInfo = woInfo[0] || null;
  }

  return c.json({
    success: true,
    verified: true,
    type: "serial_unique",
    isSuspicious,
    suspiciousWarning: isSuspicious ? `AMARAN: Kod siri ini telah diimbas sebanyak ${newCount} kali. Pastikan fizikal kotak dan hologram tidak diusik.` : null,
    details: {
      serialNumber: match.serialNumber,
      productName: match.productName,
      brand: match.productBrand,
      category: match.productCategory,
      batchNo: match.batchNo,
      supplierName: match.supplierName,
      status: match.status,
      scannedCount: newCount,
      registeredAt: match.registeredAt,
      installedInfo,
    },
  });
});

