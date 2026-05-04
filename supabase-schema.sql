-- ================================================================
-- KZEN'S PUTO BUMBONG — MASTER DATABASE SCHEMA
-- Run this entire script in your Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / DO NOTHING everywhere.
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               TEXT        PRIMARY KEY,
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  email            TEXT        UNIQUE NOT NULL,
  password         TEXT        NOT NULL,
  role             TEXT        NOT NULL DEFAULT 'customer'
                               CHECK (role IN ('admin','customer')),
  phone            TEXT        NOT NULL DEFAULT '',
  address          TEXT        NOT NULL DEFAULT '',
  security_question TEXT       NOT NULL DEFAULT '',
  security_answer  TEXT        NOT NULL DEFAULT '',
  email_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ────────────────────────────────────────────────────────────────
-- 2. PRODUCTS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          TEXT           PRIMARY KEY,
  name        TEXT           NOT NULL,
  description TEXT           NOT NULL DEFAULT '',
  price       NUMERIC(10,2)  NOT NULL DEFAULT 0,
  category    TEXT           NOT NULL DEFAULT 'Classic',
  image       TEXT           NOT NULL DEFAULT '/classic.jpg',
  stock       INTEGER        NOT NULL DEFAULT 0,
  available   BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_products_category  ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products (available);

-- ────────────────────────────────────────────────────────────────
-- 3. ORDERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             TEXT           PRIMARY KEY,
  user_id        TEXT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name  TEXT           NOT NULL,
  phone          TEXT           NOT NULL DEFAULT '',
  address        TEXT           NOT NULL DEFAULT '',
  payment        TEXT           NOT NULL DEFAULT 'cod',
  notes          TEXT           NOT NULL DEFAULT '',
  total          NUMERIC(10,2)  NOT NULL DEFAULT 0,
  status         TEXT           NOT NULL DEFAULT 'Pending'
                                CHECK (status IN ('Pending','Preparing','Ready','Completed','Cancelled')),
  payment_status TEXT           NOT NULL DEFAULT 'Pending'
                                CHECK (payment_status IN ('Pending','Paid')),
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- ────────────────────────────────────────────────────────────────
-- 4. ORDER ITEMS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         BIGSERIAL      PRIMARY KEY,
  order_id   TEXT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT           NOT NULL DEFAULT '',
  name       TEXT           NOT NULL,
  price      NUMERIC(10,2)  NOT NULL DEFAULT 0,
  qty        INTEGER        NOT NULL DEFAULT 1,
  image      TEXT           NOT NULL DEFAULT ''
);

ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- ────────────────────────────────────────────────────────────────
-- 5. VERIFICATION CODES  (email OTP — stored in DB, not memory)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_codes (
  email      TEXT        PRIMARY KEY,
  code       TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE verification_codes DISABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- 6. REVIEWS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           TEXT        PRIMARY KEY,
  order_id     TEXT        NOT NULL REFERENCES orders(id)  ON DELETE CASCADE,
  user_id      TEXT        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  product_name TEXT        NOT NULL DEFAULT '',
  rating       INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- One review per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews (order_id);
CREATE        INDEX IF NOT EXISTS idx_reviews_user_id  ON reviews (user_id);
CREATE        INDEX IF NOT EXISTS idx_reviews_rating   ON reviews (rating);

-- ────────────────────────────────────────────────────────────────
-- 7. CHAT MESSAGES  (real-time user ↔ admin chat)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT        PRIMARY KEY,
  sender_id   TEXT        NOT NULL,   -- user id  OR  'admin'
  sender_role TEXT        NOT NULL CHECK (sender_role IN ('admin','customer')),
  receiver_id TEXT        NOT NULL,   -- user id  OR  'admin'
  message     TEXT        NOT NULL,
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replied_at  TIMESTAMPTZ
);

ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_chat_sender   ON chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_receiver ON chat_messages (receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_created  ON chat_messages (created_at);

-- ────────────────────────────────────────────────────────────────
-- 8. MESSAGES  (legacy contact-form inbox — kept for compatibility)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT        PRIMARY KEY,
  name       TEXT        NOT NULL DEFAULT '',
  email      TEXT        NOT NULL DEFAULT '',
  phone      TEXT        NOT NULL DEFAULT '',
  message    TEXT        NOT NULL DEFAULT '',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_is_read    ON messages (is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);

-- ────────────────────────────────────────────────────────────────
-- SEED DATA — safe to re-run (ON CONFLICT DO NOTHING)
-- ────────────────────────────────────────────────────────────────

-- Admin user  (password: "password")
INSERT INTO users (id, first_name, last_name, email, password, role, phone, security_question, security_answer, email_verified)
VALUES ('1', 'Admin', 'Kzen', 'admin@kzen.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin', '+63 912345678', 'What is your favorite food?', 'puto bumbong', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Sample products
INSERT INTO products (id, name, description, price, category, image, stock, available) VALUES
('1','Classic Puto Bumbong','Traditional purple rice cake topped with butter, coconut and muscovado sugar.',100,'Classic','/classic.jpg',50,TRUE),
('2','Special Deluxe','Soft puto bumbong topped with cheese, butter and coconut.',100,'Special','/deluxe.jpg',40,TRUE),
('3','Cheese Overload','Extra generous cheese topping with butter and coconut flakes.',120,'Special','/classic.jpg',30,TRUE),
('4','Ube Swirl','Purple rice cake with ube halaya filling and coconut topping.',130,'Ube','/deluxe.jpg',25,TRUE),
('5','Latik Special','Topped with rich latik (coconut caramel) and muscovado sugar.',115,'Classic','/classic.jpg',35,TRUE),
('6','Party Tray (12 pcs)','Perfect for celebrations. Assorted flavors in one tray.',550,'Special','/deluxe.jpg',15,TRUE)
ON CONFLICT (id) DO NOTHING;
