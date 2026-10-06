import { and, desc, eq } from "drizzle-orm";
import {
  arahan,
  distributorClaims,
  mechanicCommissions,
  motorcycles,
  motorSales,
  partOrders,
  products,
  priceChanges,
  unitHolds,
  users,
  workOrders,
} from "@ffmotor/db";
import { nanoid } from "nanoid";
import { normalizeRole } from "../authz";

export class OwnerService {
  constructor(private db: any) {}

  async getExecutiveBoard() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const month = today.slice(0, 7);

    const [orders, sales, bikes, claims, commissions, holds, parts, changes, jobs] = await Promise.all([
      this.db.select().from(workOrders).all(),
      this.db.select().from(motorSales).all(),
      this.db.select().from(motorcycles).all(),
      this.db.select().from(distributorClaims).all(),
      this.db.select().from(mechanicCommissions).all(),
      this.db.select().from(unitHolds).all(),
      this.db.select().from(partOrders).all(),
      this.db.select().from(priceChanges).orderBy(desc(priceChanges.createdAt)).limit(30).all(),
      this.db.select().from(arahan).orderBy(desc(arahan.createdAt)).limit(30).all(),
    ]);

    const paidToday = orders.filter((o: any) => o.paymentStatus === "paid" && (o.completedAt || o.createdAt).startsWith(today));
    const salesToday = sales.filter((s: any) => s.soldAt.startsWith(today));
    const wangHari = paidToday.reduce((n: number, o: any) => n + o.grandTotal, 0) + salesToday.reduce((n: number, s: any) => n + s.salePrice, 0);
    const paidMonth = orders.filter((o: any) => o.paymentStatus === "paid" && (o.completedAt || o.createdAt).startsWith(month));
    const salesMonth = sales.filter((s: any) => s.soldAt.startsWith(month));
    const wangBulan = paidMonth.reduce((n: number, o: any) => n + o.grandTotal, 0) + salesMonth.reduce((n: number, s: any) => n + s.salePrice, 0);

    const servis = paidMonth.reduce((n: number, o: any) => n + o.totalLaborAmount, 0);
    const alat = paidMonth.reduce((n: number, o: any) => n + o.totalPartsAmount, 0);
    const bikeById = new Map<string, any>(bikes.map((b: any) => [b.id, b]));
    const marginMotor = salesMonth.reduce((n: number, s: any) => n + (s.salePrice - ((bikeById.get(s.motorcycleId) as any)?.costPrice || 0)), 0);
    const tuntutanDiterima = claims.filter((x: any) => x.status === "received" && (x.receivedAt || "").startsWith(month)).reduce((n: number, x: any) => n + x.amount, 0);
    const tuntutanBelum = claims.filter((x: any) => x.status === "accrued").reduce((n: number, x: any) => n + x.amount, 0);
    const komisenKeluar = commissions.filter((x: any) => x.createdAt.startsWith(month)).reduce((n: number, x: any) => n + x.commissionAmount, 0);
    const bersih = servis + alat + marginMotor + tuntutanDiterima - komisenKeluar;

    const masalah: { id: string; label: string; targetRole: string }[] = [];
    for (const b of bikes) {
      if (b.status !== "sold" && b.sellingPrice < b.costPrice) {
        masalah.push({ id: `price-${b.id}`, label: `${b.model} dijual bawah kos (RM ${b.sellingPrice} < RM ${b.costPrice})`, targetRole: "owner" });
      }
      if (b.status !== "sold" && b.listingStatus !== "dijual") {
        const target = b.listingStatus === "menunggu_foreman" ? "foreman" : b.listingStatus === "menunggu_harga" ? "owner" : "kerani_1";
        masalah.push({ id: `photo-${b.id}`, label: `${b.model} set sudut belum dijual (${b.listingStatus})`, targetRole: target });
      }
    }
    for (const h of holds) {
      if (h.status === "active" && h.kind === "deposit_48h") {
        masalah.push({ id: h.id, label: `Slip ${h.slipRef || "tanpa rujukan"} menunggu padanan · ${h.customerName}`, targetRole: "kerani_1" });
      }
    }

    const tergendala: { id: string; label: string; targetRole: string }[] = [];
    for (const o of orders) {
      if (o.status === "waiting_parts") {
        tergendala.push({ id: `order-${o.id}`, label: `WO ${o.woNumber} menunggu alat ganti`, targetRole: "kerani_2" });
      }
      if (o.status === "inspecting") {
        tergendala.push({ id: `order-${o.id}`, label: `WO ${o.woNumber} dalam proses QC fizikal`, targetRole: "foreman" });
      }
    }

    const aktiviti = [
      ...changes.map((c: any) => ({ at: c.createdAt, text: `Harga diubah: ${c.reason}` })),
      ...jobs.map((j: any) => ({ at: j.createdAt, text: `Arahan [${j.targetRole}]: ${j.title}` })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 15);

    return {
      wang: { hariIni: wangHari, bulanIni: wangBulan },
      untung: { servis, alat, marginMotor, tuntutanDiterima, tuntutanBelum, komisenKeluar, bersih },
      masalah,
      tergendala,
      aktiviti,
    };
  }

  async sendDirective(data: {
    title: string;
    detail?: string;
    targetRole: string;
    source?: string;
    fromUserId: string;
  }) {
    const id = `dir_${nanoid(8)}`;
    const record = {
      id,
      title: data.title,
      detail: data.detail || data.title,
      targetRole: normalizeRole(data.targetRole),
      status: "open" as const,
      fromUserId: data.fromUserId,
      source: data.source || "manual",
      createdAt: new Date().toISOString(),
    };

    await this.db.insert(arahan).values(record).run();
    return record;
  }
}
