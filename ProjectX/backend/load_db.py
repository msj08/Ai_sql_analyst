"""
One-off database loader.

Reads DATABASE_URL from the environment (or backend/.env), runs seed_data.sql
against the target Postgres database, then prints row counts so you can verify
the load succeeded.

Usage:
    DATABASE_URL='postgresql://user:pass@host/db' python load_db.py
    # or put DATABASE_URL in backend/.env and just run:
    python load_db.py
"""

import asyncio
import os
from pathlib import Path

import asyncpg
from dotenv import load_dotenv

load_dotenv()

SEED_FILE = Path(__file__).parent / "seed_data.sql"
TABLES = ["customers", "products", "orders", "order_items", "refunds"]


async def main() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is not set. Put it in backend/.env or pass it inline.")

    sql = SEED_FILE.read_text()

    print("Connecting...")
    conn = await asyncpg.connect(database_url)
    try:
        print("Running seed_data.sql (schema + sample data)...")
        await conn.execute(sql)

        print("\nVerifying row counts:")
        for table in TABLES:
            count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
            print(f"  {table:<12} {count} rows")
        print("\nDone. Database loaded successfully.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
