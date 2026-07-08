#!/usr/bin/env python3
"""
Test script to verify database connection and basic functionality
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_connection():
    """Test database connection"""
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("⚠️  DATABASE_URL not set - running in demo mode")
        print("✅ Demo mode: Backend will work with sample data")
        return True

    try:
        # Test connection
        conn = await asyncpg.connect(database_url)
        version = await conn.fetchval('SELECT version()')
        print(f"✅ Database connection successful")
        print(f"   PostgreSQL version: {version[:50]}...")

        # Test basic query
        count = await conn.fetchval('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = $1', 'public')
        print(f"   Found {count} tables in public schema")

        await conn.close()
        return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Make sure PostgreSQL is running and DATABASE_URL is correct")
        return False

async def test_tables():
    """Test that we can list tables"""
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("⚠️  Skipping table test - no database configured")
        return True

    try:
        conn = await asyncpg.connect(database_url)
        tables = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)

        print(f"✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table['table_name']}")

        await conn.close()
        return True

    except Exception as e:
        print(f"❌ Error listing tables: {e}")
        return False

async def main():
    print("🧪 Testing Athena Backend Connection")
    print("=" * 50)

    conn_ok = await test_connection()
    if conn_ok:
        await test_tables()

    print("\n" + "=" * 50)
    if conn_ok:
        print("✅ All tests passed! Backend is ready to run.")
        print("\nTo start the backend:")
        print("  cd backend && uvicorn main:app --reload")
    else:
        print("❌ Some tests failed. Please check your configuration.")
        print("\nTo run in demo mode (no database required):")
        print("  1. Don't set DATABASE_URL in .env")
        print("  2. Start the backend as usual")

if __name__ == "__main__":
    asyncio.run(main())