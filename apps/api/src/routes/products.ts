import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { InventoryService } from "../services/inventory.service";

export const productsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const addProductSchema = z.object({
  sku: z.string().min(1, "SKU diperlukan"),
  barcode: z.string().nullable().optional(),
  name: z.string().min(1, "Nama produk diperlukan"),
  category: z.string().min(1, "Kategori diperlukan"),
  brand: z.string().optional(),
  costPrice: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  stockQty: z.coerce.number().optional(),
  minAlertQty: z.coerce.number().optional(),
  rackLocation: z.string().optional(),
  isHighValue: z.boolean().optional(),
});

const adjustStockSchema = z.object({
  delta: z.coerce.number(),
  rackLocation: z.string().optional(),
});

const serialSchema = z.object({
  serialNumber: z.string().min(1, "Nombor siri diperlukan"),
  batchNo: z.string().optional(),
  supplierName: z.string().optional(),
});

// Senarai produk & carian
productsRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const inventory = new InventoryService(db);
  const q = c.req.query("q");
  const category = c.req.query("category");
  const list = await inventory.listProducts({ query: q, category });
  return c.json({ success: true, products: list });
});

// Tambah produk baharu
productsRouter.post("/", zValidator("json", addProductSchema), async (c) => {
  const db = createDb(c.env.DB);
  const inventory = new InventoryService(db);
  const body = c.req.valid("json");
  const newProduct = await inventory.addProduct(body);
  return c.json({ success: true, product: newProduct }, 201);
});

// Kemaskini stok masuk / laras stok
productsRouter.post("/:id/adjust-stock", zValidator("json", adjustStockSchema), async (c) => {
  const db = createDb(c.env.DB);
  const inventory = new InventoryService(db);
  const id = c.req.param("id");
  const { delta, rackLocation } = c.req.valid("json");
  const result = await inventory.adjustStock(id, delta, rackLocation);
  return c.json({ success: true, ...result });
});

// Kemas kini maklumat produk (Nama, Harga Jual, Kos, Lokasi Rak, dll)
const updateProductHandler = async (c: any) => {
  const db = createDb(c.env.DB);
  const inventory = new InventoryService(db);
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await inventory.updateProduct(id, body);
  return c.json({ success: true, product: updated });
};

productsRouter.patch("/:id", updateProductHandler);
productsRouter.put("/:id", updateProductHandler);

// Dapatkan senarai kod siri untuk produk tertentu
productsRouter.get("/:id/serials", async (c) => {
  const db = createDb(c.env.DB);
  const inventory = new InventoryService(db);
  const id = c.req.param("id");
  const serials = await inventory.listSerials(id);
  return c.json({ success: true, serials });
});

// Daftar kod siri keaslian untuk produk tertentu
productsRouter.post("/:id/serials", zValidator("json", serialSchema), async (c) => {
  const db = createDb(c.env.DB);
  const inventory = new InventoryService(db);
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const serial = await inventory.registerSerial(id, body);
  return c.json({ success: true, serial }, 201);
});

