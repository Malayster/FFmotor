/// <reference types="@cloudflare/workers-types" />

import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { Bindings, Variables } from "./types";
import { createDb } from "@ffmotor/db";
import { seedInitialData, seedCustomerPins } from "./seed";
import { errorHandler } from "./middlewares/error";
import { requireOwner, requireRole } from "./middlewares/guard";
import { openApiSpec } from "./docs/openapi";

import { authRouter } from "./routes/auth";
import { vehiclesRouter } from "./routes/vehicles";
import { workOrdersRouter } from "./routes/work-orders";
import { productsRouter } from "./routes/products";
import { verifyRouter } from "./routes/verify";
import { salesRouter } from "./routes/sales";
import { leadsRouter } from "./routes/leads";
import { publicRouter } from "./routes/public";
import { quotationsRouter } from "./routes/quotations";
import { locksRouter } from "./routes/locks";
import { warrantyIssuesRouter } from "./routes/warranty-issues";
import { financeClosingRouter } from "./routes/finance-closing";
import { inboxRouter } from "./routes/inbox";
import { suppliersRouter } from "./routes/suppliers";
import { staffRouter } from "./routes/staff";
import { loanPipelineRouter } from "./routes/loan-pipeline";
import { variationOrdersRouter } from "./routes/variation-orders";
import { deskRouter, ownerRouter } from "./routes/owner";
import { shotsRouter } from "./routes/shots";
import { bagRouter, shopRouter } from "./routes/shop";
import { resolveUser } from "./authz";
import { runPredictiveMileageCron } from "./cron/predictive";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.onError(errorHandler);

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-ff-user-id"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use("*", async (c, next) => {
  const user = await resolveUser(c);
  if (user) {
    c.set("user", user);
  }
  return next();
});

app.get("/api/openapi.json", (c) => c.json(openApiSpec));
app.get(
  "/api/docs",
  apiReference({
    spec: { url: "/api/openapi.json" },
    theme: "elysiajs",
    pageTitle: "FFmotor Enterprise API Documentation",
  })
);

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "FFmotor Cloudflare Edge API v2 (Type-Safe RPC)",
    architecture: "Hono RPC + Zod OpenAPI + Clean Services",
    time: new Date().toISOString(),
  });
});

app.get("/api/seed", async (c) => {
  const db = createDb(c.env.DB);
  await seedInitialData(db);
  await seedCustomerPins(db);
  return c.json({ success: true, message: "Data permulaan bengkel FFmotor berjaya dimasukkan!" });
});

publicRouter.route("/bag", bagRouter);
deskRouter.route("/shots", shotsRouter);
deskRouter.route("/shop", shopRouter);

export const apiRoutes = app
  .route("/api/auth", authRouter)
  .route("/api/vehicles", vehiclesRouter)
  .route("/api/work-orders", workOrdersRouter)
  .route("/api/products", productsRouter)
  .route("/api/verify", verifyRouter)
  .route("/api/sales", salesRouter)
  .route("/api/leads", leadsRouter)
  .route("/api/public", publicRouter)
  .route("/api/quotations", quotationsRouter)
  .route("/api/locks", locksRouter)
  .route("/api/warranty-issues", warrantyIssuesRouter)
  .route("/api/finance/closing", financeClosingRouter)
  .route("/api/inbox", inboxRouter)
  .route("/api/suppliers", suppliersRouter)
  .route("/api/staff", staffRouter)
  .route("/api/loan-pipeline", loanPipelineRouter)
  .route("/api/vo", variationOrdersRouter)
  .route("/api/owner", ownerRouter)
  .route("/api/desk", deskRouter);

export type AppType = typeof apiRoutes;

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    console.log("[SCHEDULED] Cron trigger dimulakan pada:", new Date().toISOString());
    const db = createDb(env.DB);
    ctx.waitUntil(runPredictiveMileageCron(db));
  },
};
