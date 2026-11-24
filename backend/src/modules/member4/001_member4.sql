-- Member 4 only. Run against your PostgreSQL database once.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS m4_verified_transactions (
  order_id TEXT PRIMARY KEY, buyer_id TEXT NOT NULL, seller_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','COMPLETED','CANCELLED'))
);
-- IMPORTANT: Only trusted Member 3 backend/payment confirmation code should populate the table above.
CREATE TABLE IF NOT EXISTS m4_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id TEXT NOT NULL REFERENCES m4_verified_transactions(order_id),
  seller_id TEXT NOT NULL, buyer_id TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (length(comment) BETWEEN 5 AND 1000), verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(order_id,buyer_id)
);
CREATE INDEX IF NOT EXISTS m4_reviews_seller_idx ON m4_reviews(seller_id);
CREATE TABLE IF NOT EXISTS m4_wardrobe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL,
  title TEXT NOT NULL, category TEXT NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL CHECK(purchase_price >= 0),
  wears INTEGER NOT NULL DEFAULT 0 CHECK(wears >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS m4_wardrobe_user_idx ON m4_wardrobe(user_id);
CREATE TABLE IF NOT EXISTS m4_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), host_id TEXT NOT NULL,
  title TEXT NOT NULL, location TEXT NOT NULL, starts_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity BETWEEN 2 AND 1000), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS m4_event_attendance (
  event_id UUID NOT NULL REFERENCES m4_events(id) ON DELETE CASCADE, user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(event_id,user_id)
);
CREATE TABLE IF NOT EXISTS m4_challenges (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, points INTEGER NOT NULL CHECK(points >= 0)
);
CREATE TABLE IF NOT EXISTS m4_challenge_completions (
  challenge_id TEXT REFERENCES m4_challenges(id), user_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(challenge_id,user_id)
);
INSERT INTO m4_challenges(id,title,description,points) VALUES
 ('repair','Repair, don’t replace','Mend one damaged garment and record the result.',20),
 ('rewear','Seven-day rewear','Style an existing item again across a week.',15),
 ('swap','Campus swap participation','Participate in a community clothing swap.',25)
 ON CONFLICT(id) DO NOTHING;
