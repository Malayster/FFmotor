import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { users } from "@ffmotor/db";
import { Bindings, Variables } from "../types";

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

authRouter.post("/login", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const { email, password } = body;

  const userList = await db.select().from(users).where(eq(users.email, email)).all();
  const user = userList[0];

  if (!user || user.passwordHash !== password) {
    return c.json({ success: false, message: "Email atau kata laluan tidak sah" }, 401);
  }

  return c.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    token: `demo_token_${user.id}`,
  });
});

authRouter.get("/users", async (c) => {
  const db = createDb(c.env.DB);
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    phone: users.phone,
  }).from(users).all();
  return c.json({ success: true, users: allUsers });
});

