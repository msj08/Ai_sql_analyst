-- Sample E-commerce Database Schema
-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

-- Create tables
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    signup_date DATE,
    region VARCHAR(100),
    segment VARCHAR(50)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    cost DECIMAL(10,2)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date DATE NOT NULL,
    status VARCHAR(50),
    channel VARCHAR(50)
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    refund_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255)
);

-- Insert sample data
-- Customers
INSERT INTO customers (name, signup_date, region, segment) VALUES
('Alice Johnson', '2022-01-15', 'North', 'Premium'),
('Bob Smith', '2022-02-20', 'South', 'Standard'),
('Carol Davis', '2022-03-10', 'East', 'New'),
('David Wilson', '2022-04-05', 'West', 'Premium'),
('Eve Brown', '2022-05-12', 'North', 'Standard'),
('Frank Miller', '2022-06-18', 'South', 'New'),
('Grace Lee', '2022-07-22', 'East', 'Premium'),
('Henry Taylor', '2022-08-30', 'West', 'Standard'),
('Ivy Clark', '2022-09-14', 'North', 'New'),
('Jack Lewis', '2022-10-05', 'South', 'Premium');

-- Products
INSERT INTO products (name, category, cost) VALUES
('Laptop', 'Electronics', 800.00),
('Mouse', 'Electronics', 25.00),
('Keyboard', 'Electronics', 75.00),
('Monitor', 'Electronics', 300.00),
('Desk Chair', 'Furniture', 150.00),
('Desk Lamp', 'Furniture', 35.00),
('Notebook', 'Office Supplies', 5.00),
('Pen Set', 'Office Supplies', 12.00),
('Backpack', 'Accessories', 40.00),
('Water Bottle', 'Accessories', 15.00);

-- Orders (last 6 months to have recent data)
INSERT INTO orders (customer_id, order_date, status, channel) VALUES
(1, '2024-01-15', 'completed', 'web'),
(2, '2024-01-16', 'completed', 'mobile'),
(3, '2024-01-17', 'completed', 'web'),
(1, '2024-02-01', 'completed', 'mobile'),
(4, '2024-02-05', 'completed', 'web'),
(5, '2024-02-10', 'completed', 'mobile'),
(2, '2024-02-15', 'completed', 'web'),
(6, '2024-02-20', 'completed', 'mobile'),
(3, '2024-03-01', 'completed', 'web'),
(7, '2024-03-05', 'completed', 'mobile'),
(4, '2024-03-10', 'completed', 'web'),
(8, '2024-03-15', 'completed', 'mobile'),
(5, '2024-03-20', 'completed', 'web'),
(9, '2024-03-25', 'completed', 'mobile'),
(10, '2024-04-01', 'completed', 'web'),
(1, '2024-04-05', 'completed', 'mobile'),
(2, '2024-04-10', 'completed', 'web'),
(3, '2024-04-15', 'completed', 'mobile'),
(4, '2024-04-20', 'completed', 'web'),
(5, '2024-04-25', 'completed', 'mobile');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 800.00),  -- Laptop
(1, 2, 2, 25.00),   -- Mouse
(2, 3, 1, 75.00),   -- Keyboard
(2, 4, 1, 300.00),  -- Monitor
(3, 5, 1, 150.00),  -- Desk Chair
(3, 6, 2, 35.00),   -- Desk Lamp
(4, 7, 3, 5.00),    -- Notebook
(4, 8, 1, 12.00),   -- Pen Set
(5, 9, 1, 40.00),   -- Backpack
(5, 10, 2, 15.00),  -- Water Bottle
(6, 1, 1, 800.00),  -- Laptop
(6, 2, 1, 25.00),   -- Mouse
(7, 3, 2, 75.00),   -- Keyboard
(8, 4, 1, 300.00),  -- Monitor
(9, 5, 1, 150.00),  -- Desk Chair
(10, 6, 3, 35.00),  -- Desk Lamp
(11, 7, 2, 5.00),   -- Notebook
(12, 8, 2, 12.00),  -- Pen Set
(13, 9, 1, 40.00),  -- Backpack
(14, 10, 1, 15.00), -- Water Bottle
(15, 1, 1, 800.00), -- Laptop
(16, 2, 3, 25.00),  -- Mouse
(17, 3, 1, 75.00),  -- Keyboard
(18, 4, 2, 300.00), -- Monitor
(19, 5, 1, 150.00), -- Desk Chair
(20, 6, 1, 35.00);  -- Desk Lamp

-- Refunds (a few sample refunds)
INSERT INTO refunds (order_id, refund_date, amount, reason) VALUES
(2, '2024-01-20', 75.00, 'Defective product'),
(5, '2024-02-12', 150.00, 'Changed mind'),
(10, '2024-03-08', 300.00, 'Item not as described');