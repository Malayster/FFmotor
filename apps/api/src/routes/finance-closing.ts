import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { FinanceService } from "../services/finance.service";

export const financeClosingRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const closeRegisterSchema = z.object({
  cashierId: z.string().optional(),
  openingFloat: z.coerce.number().optional(),
  systemExpectedCash: z.coerce.number().optional(),
  physicalCashCounted: z.coerce.number().optional(),
  totalActualCash: z.coerce.number().optional(),
  pettyCashTotal: z.coerce.number().optional(),
  notes: z.string().optional(),
});

// Ringkasan kiraan kaunter hari ini
financeClosingRouter.get("/current", async (c) => {
  const db = createDb(c.env.DB);
  const finance = new FinanceService(db);
  const data = await finance.getCurrentRegisterSummary();
  return c.json({ success: true, data });
});

// Senarai sejarah tutup kaunter (Z-Reports)
financeClosingRouter.get("/history", async (c) => {
  const db = createDb(c.env.DB);
  const finance = new FinanceService(db);
  const closings = await finance.getClosingHistory();
  return c.json({ success: true, closings });
});

// Simpan Penutupan Kaunter & Jana Z-Report Harian
financeClosingRouter.post("/close", zValidator("json", closeRegisterSchema), async (c) => {
  const db = createDb(c.env.DB);
  const finance = new FinanceService(db);
  const rawBody = c.req.valid("json");
  const physicalCash = rawBody.physicalCashCounted !== undefined 
    ? rawBody.physicalCashCounted 
    : (rawBody.totalActualCash !== undefined ? rawBody.totalActualCash : 0);

  const record = await finance.closeRegister({
    ...rawBody,
    physicalCashCounted: physicalCash,
  });

  return c.json({
    success: true,
    message: `Laporan Tutup Kaunter ${record.zReportNumber} berjaya dijana dan dikunci ke lejar D1!`,
    closing: record,
  });
});
