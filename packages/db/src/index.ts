export * from "./schema";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1: any) {
  return drizzle(d1, { schema });
}

export type DbClient = ReturnType<typeof createDb>;
