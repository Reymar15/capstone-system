-- ============================================
-- KZEN'S PUTO BUMBONG - SUPABASE SQL SCHEMA
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  security_question TEXT DEFAULT '',
  security_answer TEXT DEFAULT '',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT DEFAULT '/classic.jpg',
  stock INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  payment TEXT NOT NULL,
  notes TEXT DEFAULT '',
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending','Preparing','Ready','Completed','Cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (payment_status IN ('Pending','Paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  qty INTEGER NOT NULL,
  image TEXT DEFAULT ''
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- DISABLE RLS (using service role key so no RLS needed)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SAMPLE DATA — USERS
-- ============================================
INSERT INTO users (id, first_name, last_name, email, password, role, phone, security_question, security_answer, email_verified, created_at)
VALUES
('1', 'Admin', 'Kzen', 'admin@kzen.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+63 912345678', 'What is your favorite food?', 'puto bumbong', TRUE, '2025-01-01T00:00:00Z'),
('1777616288700', 'Reymar', 'Reconalla', 'reymarreconalla15@gmail.com', '$2b$10$oX5s/3N0rxxRQW4NgVEXuuT1k3m1Ochh.QJKypQTpax/0O.zDe82.', 'customer', '09423325166', 'What is your favorite food?', 'puto bumbong', TRUE, '2026-05-01T06:18:08Z'),
('1777617920537', 'Hershey Anne', 'Damulo', 'hersheyannedamulo@gmail.com', '$2b$10$k59PTuco.XhpIskQ2BnZsuZAlZD6T.1.Qe1YzU.NaOX4ygkHwK/NS', 'customer', '09863826534', 'What city were you born in?', 'cebu city', TRUE, '2026-05-01T06:45:20Z'),
('1777628217799', 'Reymar', 'Riconalla', 'reymarreconalla@gmail.com', '$2b$10$XMxjtKNMg/kvB.L2RUCbseYUTPLleQ/uQR/qjqjlWS4dSybWq7kza', 'customer', '09423325166', '', '', TRUE, '2026-05-01T09:36:57Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE DATA — PRODUCTS
-- ============================================
INSERT INTO products (id, name, description, price, category, image, stock, available)
VALUES
('1', 'Classic Puto Bumbong', 'Traditional purple rice cake topped with butter, coconut and muscovado sugar.', 100, 'Classic', '/classic.jpg', 50, TRUE),
('2', 'Special Deluxe', 'Soft puto bumbong topped with cheese, butter and coconut.', 100, 'Special', '/deluxe.jpg', 40, TRUE),
('3', 'Cheese Overload', 'Extra generous cheese topping with butter and coconut flakes.', 120, 'Special', '/classic.jpg', 30, TRUE),
('4', 'Ube Swirl', 'Purple rice cake with ube halaya filling and coconut topping.', 130, 'Ube', '/deluxe.jpg', 25, TRUE),
('5', 'Latik Special', 'Topped with rich latik (coconut caramel) and muscovado sugar.', 115, 'Classic', '/classic.jpg', 35, TRUE),
('6', 'Party Tray (12 pcs)', 'Perfect for celebrations. Assorted flavors in one tray.', 550, 'Special', '/deluxe.jpg', 15, TRUE)
ON CONFLICT (id) DO NOTHING;
