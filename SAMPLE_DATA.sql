-- SAMPLE DATA FOR KEPRIS FOODS
-- Run this in the Supabase SQL Editor to populate the database for testing.

-- 1. Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('Spice Global Ltd', 'John Obi', '08012345678', 'john@spiceglobal.com', '12 Industry Way, Lagos'),
('Organic Farms', 'Sarah Musa', '08098765432', 'sarah@organicfarms.com', 'Plot 5, Green Valley, Kano'),
('Packaging Pro', 'Bayo Ade', '07011223344', 'sales@packagingpro.com', '22 Industrial Estate, Ibadan')
ON CONFLICT (name) DO NOTHING;

-- 2. Customers
INSERT INTO customers (name, contact_person, phone, email, address, status) VALUES
('ABC Supermarket', 'Mrs. Okafor', '08112233445', 'manager@abcsuper.com', 'Victoria Island, Lagos', 'active'),
('Grand Hotel', 'Chef Michael', '08199887766', 'kitchen@grandhotel.com', 'Abuja Central District', 'active'),
('Individual Buyer - Tunde', 'Tunde Williams', '07055443322', 'tunde@email.com', 'Lekki Phase 1, Lagos', 'active')
ON CONFLICT (name) DO NOTHING;

-- 3. Items (Products)
-- We need to use the IDs from suppliers, assuming they start from 1
INSERT INTO items (name, category, quantity, unit, threshold, cost_per_unit, supplier_id, batch_number) VALUES
('Ginger Powder (100g)', 'finished', 150, 'pcs', 20, 1200, 1, 'B-GNG-001'),
('Garlic Flakes (500g)', 'finished', 80, 'pcs', 15, 2500, 1, 'B-GAR-002'),
('Turmeric Powder (Bulk)', 'raw', 50, 'kg', 10, 4500, 2, 'B-TUR-003'),
('Empty Spice Jars (Large)', 'raw', 1000, 'pcs', 200, 150, 3, 'B-JAR-001'),
('Curry Mix Special', 'finished', 5, 'pcs', 10, 3000, 1, 'B-CUR-005')
ON CONFLICT (name) DO NOTHING;

-- 4. Initial Transactions
INSERT INTO transactions (item_id, type, quantity, cost, revenue, user_id)
SELECT id, 'IN', quantity, cost_per_unit * quantity, 0, (SELECT id FROM auth.users LIMIT 1)
FROM items
ON CONFLICT DO NOTHING;
