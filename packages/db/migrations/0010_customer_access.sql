CREATE TABLE IF NOT EXISTS customer_access (
  id text PRIMARY KEY NOT NULL,
  phone text NOT NULL,
  pin_code text NOT NULL,
  name text NOT NULL,
  is_active integer NOT NULL DEFAULT 1,
  created_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS customer_sessions (
  token text PRIMARY KEY NOT NULL,
  customer_id text NOT NULL,
  expires_at text NOT NULL,
  created_at text NOT NULL
);
