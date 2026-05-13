-- SQL Migration Script for Supabase (PostgreSQL)

-- 1. Tables
CREATE TABLE IF NOT EXISTS suppliers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('raw', 'finished')),
  quantity REAL DEFAULT 0,
  unit TEXT,
  threshold REAL DEFAULT 10,
  cost_per_unit REAL DEFAULT 0,
  image_path TEXT,
  supplier_id BIGINT REFERENCES suppliers(id),
  batch_number TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  item_id BIGINT REFERENCES items(id),
  type TEXT CHECK (type IN ('IN', 'OUT')),
  quantity REAL,
  cost REAL DEFAULT 0,
  revenue REAL DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  customer_id BIGINT REFERENCES customers(id),
  supplier_id BIGINT REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS email_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  recipient TEXT,
  subject TEXT,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'invalid')),
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Example: Authenticated users can read/write)
-- For a basic setup, we allow all authenticated users. 
-- In a real app, you'd refine these based on the 'role' which can be stored in 'profiles' table.

CREATE POLICY "Allow authenticated access to suppliers" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to items" ON items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to transactions" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to settings" ON settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to email_logs" ON email_logs FOR ALL TO authenticated USING (true);
