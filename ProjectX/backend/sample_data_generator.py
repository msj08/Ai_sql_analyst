#!/usr/bin/env python3
"""
Sample data generator for the Athena SQL Data Analyst demo.
Creates a PostgreSQL database with sample e-commerce data.
"""

import asyncio
import asyncpg
import asyncio
from datetime import date, timedelta
import random
import os
from dotenv import load_dotenv

load_dotenv()

async def create_sample_data():
    """Create sample database and populate with test data."""

    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL not set in environment")
        print("Please set DATABASE_URL in your .env file")
        print("Example: postgresql://username:password@localhost:5432/analytics_demo")
        return

    try:
        # Connect to database
        print("Connecting to database...")
        conn = await asyncpg.connect(database_url)

        # Create tables
        print("Creating tables...")
        await conn.execute('''
            DROP TABLE IF EXISTS order_items;
            DROP TABLE IF EXISTS orders;
            DROP TABLE IF EXISTS refunds;
            DROP TABLE IF EXISTS products;
            DROP TABLE IF EXISTS customers;
        ''')

        # Create customers table
        await conn.execute('''
            CREATE TABLE customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                signup_date DATE,
                region VARCHAR(100),
                segment VARCHAR(50)
            )
        ''')

        # Create products table
        await conn.execute('''
            CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                cost DECIMAL(10,2)
            )
        ''')

        # Create orders table
        await conn.execute('''
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id),
                order_date DATE NOT NULL,
                status VARCHAR(50),
                channel VARCHAR(50)
            )
        ''')

        # Create order_items table
        await conn.execute('''
            CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL
            )
        ''')

        # Create refunds table
        await conn.execute('''
            CREATE TABLE refunds (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                refund_date DATE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                reason VARCHAR(255)
            )
        ''')

        # Insert sample customers
        print("Inserting sample customers...")
        customers_data = [
            ('Alice Johnson', '2022-01-15', 'North', 'Premium'),
            ('Bob Smith', '2022-02-20', 'South', 'Standard'),
            ('Carol Davis', '2022-03-10', 'East', 'New'),
            ('David Wilson', '2022-04-05', 'West', 'Premium'),
            ('Eve Brown', '2022-05-12', 'North', 'Standard'),
            ('Frank Miller', '2022-06-18', 'South', 'New'),
            ('Grace Lee', '2022-07-22', 'East', 'Premium'),
            ('Henry Taylor', '2022-08-30', 'West', 'Standard'),
            ('Ivy Clark', '2022-09-14', 'North', 'New'),
            ('Jack Lewis', '2022-10-05', 'South', 'Premium')
        ]

        await conn.executemany('''
            INSERT INTO customers (name, signup_date, region, segment)
            VALUES ($1, $2, $3, $4)
        ''', customers_data)

        # Insert sample products
        print("Inserting sample products...")
        products_data = [
            ('Laptop', 'Electronics', 800.00),
            ('Mouse', 'Electronics', 25.00),
            ('Keyboard', 'Electronics', 75.00),
            ('Monitor', 'Electronics', 300.00),
            ('Desk Chair', 'Furniture', 150.00),
            ('Desk Lamp', 'Furniture', 35.00),
            ('Notebook', 'Office Supplies', 5.00),
            ('Pen Set', 'Office Supplies', 12.00),
            ('Backpack', 'Accessories', 40.00),
            ('Water Bottle', 'Accessories', 15.00)
        ]

        await conn.executemany('''
            INSERT INTO products (name, category, cost)
            VALUES ($1, $2, $3)
        ''', products_data)

        # Insert sample orders (last 6 months)
        print("Inserting sample orders...")
        orders_data = []
        base_date = date(2024, 1, 1)
        customer_ids = list(range(1, 11))  # 10 customers
        statuses = ['completed', 'pending', 'shipped', 'cancelled']
        channels = ['web', 'mobile', 'in-store']

        for i in range(20):  # 20 orders
            customer_id = random.choice(customer_ids)
            order_date = base_date + timedelta(days=random.randint(0, 180))
            status = random.choice(statuses)
            channel = random.choice(channels)
            orders_data.append((customer_id, order_date, status, channel))

        await conn.executemany('''
            INSERT INTO orders (customer_id, order_date, status, channel)
            VALUES ($1, $2, $3, $4)
        ''', orders_data)

        # Get order IDs for inserting order items
        order_ids = [row['id'] for row in await conn.fetch('SELECT id FROM orders')]

        # Insert sample order items
        print("Inserting sample order items...")
        order_items_data = []
        product_ids = list(range(1, 11))  # 10 products

        for order_id in order_ids:
            # 1-4 items per order
            num_items = random.randint(1, 4)
            selected_products = random.sample(product_ids, min(num_items, len(product_ids)))

            for product_id in selected_products:
                quantity = random.randint(1, 5)
                # Get product price and add some variation
                base_price = {
                    1: 800.00, 2: 25.00, 3: 75.00, 4: 300.00, 5: 150.00,
                    6: 35.00, 7: 5.00, 8: 12.00, 9: 40.00, 10: 15.00
                }[product_id]
                unit_price = round(base_price * random.uniform(0.9, 1.1), 2)
                order_items_data.append((order_id, product_id, quantity, unit_price))

        await conn.executemany('''
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            VALUES ($1, $2, $3, $4)
        ''', order_items_data)

        # Insert sample refunds
        print("Inserting sample refunds...")
        refunds_data = []
        # Select a few orders to refund
        refund_orders = random.sample(order_ids, min(3, len(order_ids)))

        for order_id in refund_orders:
            # Get order date to set refund date after order
            order_date = (await conn.fetchrow('SELECT order_date FROM orders WHERE id = $1', order_id))['order_date']
            refund_date = order_date + timedelta(days=random.randint(5, 30))

            # Calculate refund amount (partial or full refund of order)
            order_total = await conn.fetchval('''
                SELECT COALESCE(SUM(quantity * unit_price), 0)
                FROM order_items
                WHERE order_id = $1
            ''', order_id)

            if order_total > 0:
                refund_amount = round(order_total * random.uniform(0.1, 0.8), 2)
                reason = random.choice(['Defective product', 'Changed mind', 'Item not as described', 'Shipping damage'])
                refunds_data.append((order_id, refund_date, refund_amount, reason))

        await conn.executemany('''
            INSERT INTO refunds (order_id, refund_date, amount, reason)
            VALUES ($1, $2, $3, $4)
        ''', refunds_data)

        # Print summary
        customer_count = await conn.fetchval('SELECT COUNT(*) FROM customers')
        product_count = await conn.fetchval('SELECT COUNT(*) FROM products')
        order_count = await conn.fetchval('SELECT COUNT(*) FROM orders')
        order_items_count = await conn.fetchval('SELECT COUNT(*) FROM order_items')
        refunds_count = await conn.fetchval('SELECT COUNT(*) FROM refunds')

        print("\nSample data creation completed!")
        print(f"Created:")
        print(f"  - {customer_count} customers")
        print(f"  - {product_count} products")
        print(f"  - {order_count} orders")
        print(f"  - {order_items_count} order items")
        print(f"  - {refunds_count} refunds")

        await conn.close()

    except Exception as e:
        print(f"Error creating sample data: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(create_sample_data())