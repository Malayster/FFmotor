import { eq, desc } from "drizzle-orm";
import { cashClosings, workOrders } from "@ffmotor/db";
import { nanoid } from "nanoid";

export class FinanceService {
  constructor(private db: any) {}

  async getCurrentRegisterSummary() {
    const orders = await this.db.select().from(workOrders).all();
    const paidOrders = orders.filter((w: any) => w.paymentStatus === "paid");

    const totalMasukSah = paidOrders.reduce((acc: number, curr: any) => acc + (curr.grandTotal || 0), 0);
    const totalLabor = paidOrders.reduce((acc: number, curr: any) => acc + (curr.totalLaborAmount || 0), 0);
    const totalParts = paidOrders.reduce((acc: number, curr: any) => acc + (curr.totalPartsAmount || 0), 0);

    const unpaidOrders = orders.filter((w: any) => w.paymentStatus === "unpaid" && w.status !== "cancelled");
    const totalBelumBayar = unpaidOrders.reduce((acc: number, curr: any) => acc + (curr.grandTotal || 0), 0);

    return {
      totalMasukSah,
      totalLabor,
      totalParts,
      totalBelumBayar,
      unpaidCount: unpaidOrders.length,
      paidCount: paidOrders.length,
    };
  }

  async getClosingHistory() {
    return this.db.select().from(cashClosings).orderBy(desc(cashClosings.closingDate)).all();
  }

  async closeRegister(params: {
    openingFloat?: number;
    systemExpectedCash?: number;
    physicalCashCounted?: number;
    pettyCashTotal?: number;
    notes?: string;
  }) {
    const id = nanoid();
    const todayStr = new Date().toISOString().slice(0, 10);
    const zReportNumber = `ZR-${todayStr.replace(/-/g, "")}-${Math.floor(10 + Math.random() * 90)}`;

    const openingFloat = Number(params.openingFloat || 200);
    const systemExpectedCash = Number(params.systemExpectedCash || 0);
    const physicalCashCounted = Number(params.physicalCashCounted || 0);
    const pettyCashTotal = Number(params.pettyCashTotal || 0);
    const variance = physicalCashCounted - systemExpectedCash;
    const isBalanced = Math.abs(variance) < 1.0;

    const record = {
      id,
      zReportNumber,
      closingDate: todayStr,
      openingFloat,
      systemExpectedCash,
      physicalCashCounted,
      variance,
      pettyCashTotal,
      isBalanced,
      notes: params.notes || (isBalanced ? "Kiraan laci seimbang (Tally)" : `Varians RM ${variance.toFixed(2)}`),
      closedAt: new Date().toISOString(),
    };

    await this.db.insert(cashClosings).values(record).run();
    return record;
  }
}
