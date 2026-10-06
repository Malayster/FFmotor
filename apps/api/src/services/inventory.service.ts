import { eq } from "drizzle-orm";
import { products, productSerials } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { NotFoundError, ValidationError } from "../middlewares/error";

export class InventoryService {
  constructor(private db: any) {}

  async listProducts(params?: { query?: string; category?: string }) {
    let list = await this.db.select().from(products).orderBy(products.category, products.name).all();

    if (params?.category && params.category !== "all") {
      list = list.filter((p: any) => p.category === params.category);
    }

    if (params?.query) {
      const q = params.query.toLowerCase();
      list = list.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q)) ||
          p.rackLocation.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getLowStockAlerts() {
    const all = await this.db.select().from(products).all();
    return all.filter((p: any) => p.stockQty <= p.minAlertQty);
  }

  async addProduct(data: {
    sku: string;
    barcode?: string | null;
    name: string;
    category: string;
    brand?: string;
    costPrice?: number;
    sellingPrice?: number;
    stockQty?: number;
    minAlertQty?: number;
    rackLocation?: string;
    isHighValue?: boolean;
  }) {
    if (!data.sku || !data.name || !data.category) {
      throw new ValidationError("SKU, Nama dan Kategori diperlukan.");
    }

    const now = new Date().toISOString();
    const newProduct = {
      id: `prod_${nanoid(8)}`,
      sku: data.sku.toUpperCase().trim(),
      barcode: data.barcode || null,
      name: data.name,
      category: data.category,
      brand: data.brand || "Generik",
      costPrice: data.costPrice || 0,
      sellingPrice: data.sellingPrice || 0,
      stockQty: data.stockQty || 0,
      minAlertQty: data.minAlertQty || 5,
      rackLocation: data.rackLocation || "RAK-A1",
      isHighValue: Boolean(data.isHighValue),
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(products).values(newProduct);
    return newProduct;
  }

  async adjustStock(id: string, delta: number, rackLocation?: string) {
    const prodList = await this.db.select().from(products).where(eq(products.id, id)).all();
    const prod = prodList[0];
    if (!prod) throw new NotFoundError("Produk tidak dijumpai.");

    const newQty = Math.max(0, prod.stockQty + delta);
    const now = new Date().toISOString();

    await this.db
      .update(products)
      .set({
        stockQty: newQty,
        rackLocation: rackLocation || prod.rackLocation,
        updatedAt: now,
      })
      .where(eq(products.id, id));

    return { stockQty: newQty };
  }

  async registerSerial(productId: string, data: { serialNumber: string; batchNo?: string; supplierName?: string }) {
    if (!data.serialNumber) {
      throw new ValidationError("Nombor siri diperlukan.");
    }

    const prodList = await this.db.select().from(products).where(eq(products.id, productId)).all();
    if (!prodList[0]) throw new NotFoundError("Produk tidak dijumpai.");

    const serial = {
      id: `ser_${nanoid(8)}`,
      productId,
      serialNumber: data.serialNumber.trim().toUpperCase(),
      batchNo: data.batchNo || null,
      supplierName: data.supplierName || "Pengedar Sah",
      status: "in_stock" as const,
      receivedAt: new Date().toISOString(),
    };

    await this.db.insert(productSerials).values(serial);
    return serial;
  }

  async listSerials(productId: string) {
    return await this.db
      .select()
      .from(productSerials)
      .where(eq(productSerials.productId, productId))
      .all();
  }

  async updateProduct(id: string, data: Partial<{
    name: string;
    brand: string;
    category: string;
    sellingPrice: number;
    costPrice: number;
    stockQty: number;
    minAlertQty: number;
    rackLocation: string;
    isHighValue: boolean;
  }>) {
    const prodList = await this.db.select().from(products).where(eq(products.id, id)).all();
    const prod = prodList[0];
    if (!prod) throw new NotFoundError("Produk tidak dijumpai.");

    const now = new Date().toISOString();
    const updateData: any = { updatedAt: now };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.sellingPrice !== undefined) updateData.sellingPrice = Number(data.sellingPrice);
    if (data.costPrice !== undefined) updateData.costPrice = Number(data.costPrice);
    if (data.stockQty !== undefined) updateData.stockQty = Number(data.stockQty);
    if (data.minAlertQty !== undefined) updateData.minAlertQty = Number(data.minAlertQty);
    if (data.rackLocation !== undefined) updateData.rackLocation = data.rackLocation;
    if (data.isHighValue !== undefined) updateData.isHighValue = Boolean(data.isHighValue);

    await this.db.update(products).set(updateData).where(eq(products.id, id));
    const updated = await this.db.select().from(products).where(eq(products.id, id)).all();
    return updated[0];
  }
}

