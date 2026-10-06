CREATE TABLE IF NOT EXISTS staff_sessions (
  token text PRIMARY KEY NOT NULL,
  user_id text NOT NULL,
  expires_at text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
