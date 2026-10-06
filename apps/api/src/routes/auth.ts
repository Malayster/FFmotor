import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { AuthService } from "../services/auth.service";

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const loginSchema = z.object({
  email: z.string().email("Format emel tidak sah"),
  password: z.string().min(1, "Kata laluan diperlukan"),
});

const zeroTrustSchema = z.object({
  pin: z.string().optional(),
  cfAccessEmail: z.string().email().optional(),
  requestedRole: z.string().optional(),
});

authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
  const db = createDb(c.env.DB);
  const authService = new AuthService(db);
  const { email, password } = c.req.valid("json");

  const result = await authService.loginWithEmail(email, password);
  return c.json({ success: true, ...result });
});

const verifyStationHandler = async (c: any) => {
  const db = createDb(c.env.DB);
  const authService = new AuthService(db);
  const body = c.req.valid("json");

  const cfAccessEmail = c.req.header("cf-access-authenticated-user-email") || body.cfAccessEmail;
  const ip = c.req.header("cf-connecting-ip") || "127.0.0.1";
  const country = c.req.header("cf-ipcountry") || "MY";

  const result = await authService.verifyPinOrZeroTrust({
    pin: body.pin,
    cfAccessEmail,
    requestedRole: body.requestedRole,
    ip,
    country,
  });

  return c.json({ success: true, ...result });
};

authRouter.post("/zero-trust/verify", zValidator("json", zeroTrustSchema), verifyStationHandler);
authRouter.post("/station/verify", zValidator("json", zeroTrustSchema), verifyStationHandler);
authRouter.post("/pin/verify", zValidator("json", zeroTrustSchema), verifyStationHandler);
