import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from click import prompt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
try:
    import asyncpg
except ImportError:
    asyncpg = None
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic SQL Data Analyst", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection pool
db_pool: Any = None


# Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")
print("Gemini Key Loaded:", os.getenv("GEMINI_API_KEY"))


# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class SQLQueryRequest(BaseModel):
    query: str
    read_only: bool = True

class ChartSpec(BaseModel):
    chart_type: str
    data: List[Dict[str, Any]]
    x: str
    y: str
    title: str

class Insight(BaseModel):
    id: str
    title: str
    summary: str
    chart_or_table_ref: Dict[str, Any]
    sql: str
    created_at: datetime

# In-memory storage for pinned insights (in production, use Redis or database)
pinned_insights: List[Insight] = []

# Startup event
@app.on_event("startup")
async def startup_event():
    global db_pool
    if asyncpg is None:
        logger.warning("asyncpg not installed, skipping database connection pool setup")
        return
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL not set, using sample data mode")
        # We'll create a mock database connection for demo purposes
        return

    try:
        db_pool = await asyncpg.create_pool(database_url)
        logger.info("Database connection pool created")
    except Exception as e:
        logger.error(f"Failed to create database pool: {e}")
        # Continue without database for demo mode
        # Continue without database for demo mode

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    global db_pool
    if db_pool:
        await db_pool.close()
        logger.info("Database connection pool closed")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Agent tools implementation
@app.post("/tools/list_tables")
async def list_tables():
    """List all tables in the database"""
    if not db_pool:
        # Return sample tables for demo
        return {
            "tables": ["customers", "orders", "order_items", "products", "refunds"]
        }

    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            return {"tables": [row['table_name'] for row in rows]}
    except Exception as e:
        logger.error(f"Error listing tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/get_schema")
async def get_schema(table_name: str):
    """Get schema for a specific table"""
    if not db_pool:
        # Return sample schema for demo
        sample_schemas = {
            "customers": {
                "columns": [
                    {"name": "id", "type": "integer", "nullable": False, "primary_key": True},
                    {"name": "name", "type": "varchar(255)", "nullable": False},
                    {"name": "signup_date", "type": "date", "nullable": True},
                    {"name": "region", "type": "varchar(100)", "nullable": True},
                    {"name": "segment", "type": "varchar(50)", "nullable": True}
                ],
                "primary_key": ["id"],
                "foreign_keys": []
            },
            "orders": {
                "columns": [
                    {"name": "id", "type": "integer", "nullable": False, "primary_key": True},
                    {"name": "customer_id", "type": "integer", "nullable": False},
                    {"name": "order_date", "type": "date", "nullable": False},
                    {"name": "status", "type": "varchar(50)", "nullable": True},
                    {"name": "channel", "type": "varchar(50)", "nullable": True}
                ],
                "primary_key": ["id"],
                "foreign_keys": [
                    {"column": "customer_id", "references": "customers(id)"}
                ]
            },
            "order_items": {
                "columns": [
                    {"name": "id", "type": "integer", "nullable": False, "primary_key": True},
                    {"name": "order_id", "type": "integer", "nullable": False},
                    {"name": "product_id", "type": "integer", "nullable": False},
                    {"name": "quantity", "type": "integer", "nullable": False},
                    {"name": "unit_price", "type": "decimal(10,2)", "nullable": False}
                ],
                "primary_key": ["id"],
                "foreign_keys": [
                    {"column": "order_id", "references": "orders(id)"},
                    {"column": "product_id", "references": "products(id)"}
                ]
            },
            "products": {
                "columns": [
                    {"name": "id", "type": "integer", "nullable": False, "primary_key": True},
                    {"name": "name", "type": "varchar(255)", "nullable": False},
                    {"name": "category", "type": "varchar(100)", "nullable": True},
                    {"name": "cost", "type": "decimal(10,2)", "nullable": True}
                ],
                "primary_key": ["id"],
                "foreign_keys": []
            },
            "refunds": {
                "columns": [
                    {"name": "id", "type": "integer", "nullable": False, "primary_key": True},
                    {"name": "order_id", "type": "integer", "nullable": False},
                    {"name": "refund_date", "type": "date", "nullable": False},
                    {"name": "amount", "type": "decimal(10,2)", "nullable": False},
                    {"name": "reason", "type": "varchar(255)", "nullable": True}
                ],
                "primary_key": ["id"],
                "foreign_keys": [
                    {"column": "order_id", "references": "orders(id)"}
                ]
            }
        }
        return sample_schemas.get(table_name, {"error": f"Table {table_name} not found"})

    try:
        async with db_pool.acquire() as conn:
            # Get columns
            columns_rows = await conn.fetch("""
                SELECT
                    column_name,
                    data_type,
                    is_nullable = 'YES' as nullable,
                    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT ku.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage ku
                        ON tc.constraint_name = ku.constraint_name
                    WHERE tc.constraint_type = 'PRIMARY KEY'
                        AND tc.table_name = $1
                ) pk ON c.column_name = pk.column_name
                WHERE c.table_name = $1 AND c.table_schema = 'public'
                ORDER BY c.ordinal_position
            """, table_name)

            # Get foreign keys
            fk_rows = await conn.fetch("""
                SELECT
                    ku.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage ku
                    ON tc.constraint_name = ku.constraint_name
                JOIN information_schema.constraint_column_usage ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_name = $1
                    AND tc.table_schema = 'public'
            """, table_name)

            columns = []
            for row in columns_rows:
                columns.append({
                    "name": row['column_name'],
                    "type": row['data_type'],
                    "nullable": row['nullable'],
                    "primary_key": row['is_primary_key']
                })

            foreign_keys = []
            for row in fk_rows:
                foreign_keys.append({
                    "column": row['column_name'],
                    "references": f"{row['foreign_table_name']}({row['foreign_column_name']})"
                })

            return {
                "columns": columns,
                "primary_key": [col['name'] for col in columns if col['primary_key']],
                "foreign_keys": foreign_keys
            }
    except Exception as e:
        logger.error(f"Error getting schema for table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/sample_rows")
async def sample_rows(table_name: str, limit: int = 5):
    """Get sample rows from a table"""
    if not db_pool:
        # Return sample data for demo
        import random
        from datetime import date, timedelta

        sample_data = {
            "customers": [
                {"id": 1, "name": "John Doe", "signup_date": "2023-01-15", "region": "North", "segment": "Premium"},
                {"id": 2, "name": "Jane Smith", "signup_date": "2023-02-20", "region": "South", "segment": "Standard"},
                {"id": 3, "name": "Bob Johnson", "signup_date": "2023-03-10", "region": "East", "segment": "Basic"},
                {"id": 4, "name": "Alice Brown", "signup_date": "2023-04-05", "region": "West", "segment": "Premium"},
                {"id": 5, "name": "Charlie Wilson", "signup_date": "2023-05-12", "region": "North", "segment": "Standard"}
            ],
            "orders": [
                {"id": 101, "customer_id": 1, "order_date": "2024-01-10", "status": "completed", "channel": "web"},
                {"id": 102, "customer_id": 2, "order_date": "2024-01-12", "status": "completed", "channel": "mobile"},
                {"id": 103, "customer_id": 3, "order_date": "2024-01-15", "status": "pending", "channel": "web"},
                {"id": 104, "customer_id": 1, "order_date": "2024-01-18", "status": "completed", "channel": "mobile"},
                {"id": 105, "customer_id": 4, "order_date": "2024-01-20", "status": "shipped", "channel": "web"}
            ],
            "order_items": [
                {"id": 1, "order_id": 101, "product_id": 1, "quantity": 2, "unit_price": 29.99},
                {"id": 2, "order_id": 101, "product_id": 2, "quantity": 1, "unit_price": 15.50},
                {"id": 3, "order_id": 102, "product_id": 3, "quantity": 3, "unit_price": 9.99},
                {"id": 4, "order_id": 103, "product_id": 1, "quantity": 1, "unit_price": 29.99},
                {"id": 5, "order_id": 104, "product_id": 4, "quantity": 1, "unit_price": 49.99}
            ],
            "products": [
                {"id": 1, "name": "Laptop", "category": "Electronics", "cost": 800.00},
                {"id": 2, "name": "Mouse", "category": "Electronics", "cost": 15.00},
                {"id": 3, "name": "Keyboard", "category": "Electronics", "cost": 25.00},
                {"id": 4, "name": "Monitor", "category": "Electronics", "cost": 200.00},
                {"id": 5, "name": "USB Cable", "category": "Electronics", "cost": 5.00}
            ],
            "refunds": [
                {"id": 1, "order_id": 102, "refund_date": "2024-01-18", "amount": 30.00, "reason": "defective"},
                {"id": 2, "order_id": 104, "refund_date": "2024-01-22", "amount": 25.00, "reason": "changed_mind"}
            ]
        }

        data = sample_data.get(table_name, [])
        return {
            "rows": data[:limit],
            "row_count": len(data),
            "columns": list(data[0].keys()) if data else []
        }

    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch(f"SELECT * FROM {table_name} LIMIT $1", limit)
            # Convert to list of dicts
            data = [dict(row) for row in rows]
            return {
                "rows": data,
                "row_count": len(data),
                "columns": list(data[0].keys()) if data else []
            }
    except Exception as e:
        logger.error(f"Error sampling rows from table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/run_sql")
async def run_sql(request: SQLQueryRequest):
    """Execute SQL query against the database"""
    # Basic SQL injection prevention - in production, use proper query validation
    query_upper = request.query.upper().strip()

    # Check for dangerous operations
    dangerous_keywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'CREATE', 'EXEC']
    if not request.read_only:
        # Even with read_only=False, we might want to restrict some operations
        pass  # Allow write operations if explicitly permitted
    else:
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                raise HTTPException(
                    status_code=400,
                    detail=f"Read-only mode prohibits {keyword} operations"
                )

    if not db_pool:
        # Return mock results for demo
        logger.info("Running in demo mode - returning mock results")

        # Simple mock based on query patterns
        if "REVENUE" in query_upper and "MONTH" in query_upper:
            # Mock revenue by month data
            mock_data = []
            base_date = datetime(2024, 1, 1)
            for i in range(6):
                month_date = base_date.replace(month=base_date.month + i)
                mock_data.append({
                    "month": month_date.strftime("%Y-%m"),
                    "revenue": round(10000 + (i * 1500) + (hash(str(i)) % 2000), 2)
                })
            return {
                "rows": mock_data,
                "row_count": len(mock_data),
                "columns": ["month", "revenue"]
            }
        elif "COUNT" in query_upper or "SUM" in query_upper:
            return {
                "rows": [{"count": 150, "total": 45000.00}],
                "row_count": 1,
                "columns": ["count", "total"]
            }
        else:
            # Generic mock data
            return {
                "rows": [{"id": 1, "name": "Sample Data", "value": 100}],
                "row_count": 1,
                "columns": ["id", "name", "value"]
            }

    try:
        async with db_pool.acquire() as conn:
            # Log the query for auditability
            logger.info(f"Executing SQL: {request.query}")

            # Execute query
            start_time = datetime.utcnow()
            rows = await conn.fetch(request.query)
            end_time = datetime.utcnow()

            execution_time = (end_time - start_time).total_seconds()
            logger.info(f"Query executed in {execution_time:.2f} seconds, returned {len(rows)} rows")

            # Convert to list of dicts
            data = [dict(row) for row in rows]

            return {
                "rows": data,
                "row_count": len(data),
                "columns": list(data[0].keys()) if data else [],
                "execution_time_seconds": execution_time
            }
    except Exception as e:
        logger.error(f"Error executing SQL: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/explain_query")
async def explain_query(query: str):
    """Get query plan/explanation"""
    if not db_pool:
        return {
            "plan": "Demo mode - query plan not available",
            "estimated_cost": "N/A"
        }

    try:
        async with db_pool.acquire() as conn:
            # Get EXPLAIN ANALYZE plan
            explain_query = f"EXPLAIN ANALYZE {query}"
            rows = await conn.fetch(explain_query)
            plan_text = "\n".join([row['QUERY PLAN'] for row in rows])

            return {
                "plan": plan_text,
                "estimated_cost": "See plan above"
            }
    except Exception as e:
        logger.error(f"Error explaining query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/render_chart")
async def render_chart(chart_spec: ChartSpec):
    """Render chart specification for frontend"""
    # In a real implementation, this might generate actual chart data
    # For now, we'll return the spec as-is for the frontend to handle
    return {
        "chart_spec": chart_spec.dict(),
        "message": "Chart specification ready for frontend rendering"
    }

@app.post("/tools/pin_insight")
async def pin_insight(title: str, summary: str, chart_or_table_ref: dict, sql: str):
    """Pin an insight to the dashboard"""
    insight_id = f"insight_{len(pinned_insights) + 1}_{int(datetime.utcnow().timestamp())}"

    insight = Insight(
        id=insight_id,
        title=title,
        summary=summary,
        chart_or_table_ref=chart_or_table_ref,
        sql=sql,
        created_at=datetime.utcnow()
    )

    pinned_insights.append(insight)
    logger.info(f"Pinned insight: {title}")

    return {"id": insight_id, "message": "Insight pinned successfully"}

@app.get("/dashboard/insights")
async def get_pinned_insights():
    """Get all pinned insights for the dashboard"""
    return {
        "insights": [insight.dict() for insight in pinned_insights]
    }

@app.delete("/dashboard/insights/{insight_id}")
async def unpin_insight(insight_id: str):
    """Remove an insight from the dashboard"""
    global pinned_insights
    pinned_insights = [insight for insight in pinned_insights if insight.id != insight_id]
    logger.info(f"Unpinned insight: {insight_id}")
    return {"message": "Insight removed successfully"}

# Chat endpoint - main agent interface
@app.post("/chat")
async def chat_endpoint(message: ChatMessage):
    """Main chat endpoint for the agentic SQL analyst"""
    try:
        # Process the user's message through our agent logic
        response = await process_user_question(message.message, message.session_id)
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def build_chart(rows):
    """
    Convert SQL result rows into a chart specification.
    """

    if not rows:
        return None

    if len(rows[0].keys()) < 2:
        return None

    columns = list(rows[0].keys())

    x = columns[0]
    y = columns[1]

    # Detect line chart if first column looks like time
    if any(word in x.lower() for word in ["date", "month", "year", "time"]):
        chart_type = "line"
    else:
        chart_type = "bar"

    return {
        "chart_type": chart_type,
        "data": rows,
        "x": x,
        "y": y
    }
async def process_user_question(question: str, session_id=None):

    logger.info(question)

    prompt = f"""
You are Athena, an SQL expert.

Database:

customers(id,name,signup_date,region,segment)

orders(id,customer_id,order_date,status,channel)

order_items(id,order_id,product_id,quantity,unit_price)

products(id,name,category,cost)

refunds(id,order_id,refund_date,amount,reason)

User Question:

{question}

Return ONLY JSON.

{{
    "answer":"...",
    "sql":"...",
    "notes":"...",
    "next_steps":[]
}}
"""

    try:

        print("STEP 1 - process_user_question called")
        print("STEP 2 - Prompt created")

        response = model.generate_content(prompt)

        print("STEP 3 - Gemini responded")
        print("========== GEMINI RAW RESPONSE ==========")
        print(response.text)
        print("=========================================")

        text = response.text.replace("```json", "").replace("```", "").strip()

        data = json.loads(text)

        sql = (data.get("sql") or "").strip()

        # If Gemini didn't generate SQL, don't execute anything.
        if not sql:
            return {
                "answer": data.get("answer"),
                "detail": {},
                "sql": "",
                "notes": data.get("notes"),
                "next_steps": data.get("next_steps", [])
            }

        # Execute SQL
        sql_result = await run_sql(
            SQLQueryRequest(
                query=sql,
                read_only=True
            )
        )

        rows = sql_result["rows"]
        print("========== SQL RESULT ==========")
        print(rows)

        # Build chart
        chart = build_chart(rows)
        print("========== CHART ==========")
        print(chart)

        # Save insight
        insight = Insight(
            id=f"insight_{datetime.utcnow().timestamp()}",
            title=question,
            summary=data.get("answer"),
            chart_or_table_ref=chart,
            sql=sql,
            created_at=datetime.utcnow()
        )

        pinned_insights.append(insight)

        return {
            "answer": data.get("answer"),
            "detail": {
                "chart": chart,
                "table": rows
            },
            "sql": sql,
            "notes": data.get("notes"),
            "next_steps": data.get("next_steps", [])
        }

    except Exception as e:

        logger.exception(e)
        print("========== FINAL RESPONSE ==========")
        print({
            "answer": data.get("answer"),
            "detail": {
                "chart": chart,
                "table": rows
            },
            "sql": sql,
            "notes": data.get("notes"),
            "next_steps": data.get("next_steps", [])
        })

        return {
            "answer": data.get("answer"),
            "detail": {
                "chart": chart,
                "table": rows
            },
            "sql": sql,
            "notes": data.get("notes"),
            "next_steps": data.get("next_steps", [])
        }

    except Exception as e:
        logger.exception(e)

        return {
            "answer": str(e),
            "detail": {},
            "sql": "",
            "notes": "",
            "next_steps": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)