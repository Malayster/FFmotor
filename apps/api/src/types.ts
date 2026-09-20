export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ENVIRONMENT?: string;
};

export type Variables = {
  user?: {
    id: string;
    name: string;
    role: "admin" | "cashier" | "mechanic" | "sales";
  };
};
