import { Hono } from "hono";
import { cors } from "hono/cors";
import { Bindings, Variables } from "./types";
import { createDb } from "@ffmotor/db";
import { seedInitialData } from "./seed";
import { authRouter } from "./routes/auth";
import { vehiclesRouter } from "./routes/vehicles";
import { workOrdersRouter } from "./routes/work-orders";
import { productsRouter } from "./routes/products";
import { verifyRouter } from "./routes/verify";
import { salesRouter } from "./routes/sales";
import { leadsRouter } from "./routes/leads";
import { publicRouter } from "./routes/public";
import { runPredictiveMileageCron } from "./cron/predictive";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Enable CORS for web frontend
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Auto-seed endpoint untuk kemudahan persediaan awal
app.get("/api/seed", async (c) => {
  const db = createDb(c.env.DB);
  await seedInitialData(db);
  return c.json({ success: true, message: "Data permulaan bengkel FFmotor berjaya dimasukkan!" });
});

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "FFmotor Cloudflare Edge API",
    time: new Date().toISOString(),
  });
});

// Route registration
app.route("/api/auth", authRouter);
app.route("/api/vehicles", vehiclesRouter);
app.route("/api/work-orders", workOrdersRouter);
app.route("/api/products", productsRouter);
app.route("/api/verify", verifyRouter);
app.route("/api/sales", salesRouter);
app.route("/api/leads", leadsRouter);
app.route("/api/public", publicRouter);

// Export worker handler with Cloudflare Cron Trigger (scheduled event)
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    console.log("[SCHEDULED] Cron trigger dimulakan pada:", new Date().toISOString());
    const db = createDb(env.DB);
    ctx.waitUntil(runPredictiveMileageCron(db));
  },
};
