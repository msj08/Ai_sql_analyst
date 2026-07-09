import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncpg
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
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Configure it in backend/.env before starting the server."
    )
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))
logger.info("Gemini client configured")


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
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Configure it in backend/.env before starting the server."
        )
    db_pool = await asyncpg.create_pool(database_url)
    logger.info("Database connection pool created")

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
You are Athena, an expert data analyst working with a PostgreSQL database.

Rules for the "sql" field:
- Generate ONLY PostgreSQL-compatible SQL. Never use MySQL syntax such as
  SHOW TABLES, SHOW COLUMNS, DESCRIBE, or backticks.
- Write a single read-only SELECT statement. Never INSERT, UPDATE, DELETE,
  DROP, ALTER, TRUNCATE, or CREATE.
- To list the tables, query information_schema.tables
  (e.g. SELECT table_name FROM information_schema.tables WHERE table_schema='public').
- If the question is conversational (like "hi") and needs no data, leave "sql" empty.

Database schema:

customers(id, name, signup_date, region, segment)
orders(id, customer_id, order_date, status, channel)
order_items(id, order_id, product_id, quantity, unit_price)
products(id, name, category, cost)
refunds(id, order_id, refund_date, amount, reason)

Revenue = SUM(order_items.quantity * order_items.unit_price).

User Question:

{question}

Return ONLY JSON in exactly this shape (no markdown, no extra text):

{{
    "answer": "a short natural-language answer",
    "sql": "the PostgreSQL query, or empty string if none is needed",
    "notes": "any caveats",
    "next_steps": []
}}
"""

    try:
        logger.info("Sending question to Gemini")
        response = model.generate_content(prompt)

        # Gemini often wraps its JSON in a ```json ... ``` fence; strip it.
        text = response.text.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            logger.error("Gemini did not return valid JSON: %s", text)
            return {
                "answer": "Sorry, I couldn't interpret that question. Please try rephrasing it.",
                "detail": {},
                "sql": "",
                "notes": "",
                "next_steps": [],
            }

        sql = (data.get("sql") or "").strip()

        # If Gemini didn't produce SQL, return the answer without querying anything.
        if not sql:
            return {
                "answer": data.get("answer"),
                "detail": {},
                "sql": "",
                "notes": data.get("notes"),
                "next_steps": data.get("next_steps", []),
            }

        # Run the generated SQL (read-only) against the database.
        sql_result = await run_sql(SQLQueryRequest(query=sql, read_only=True))
        rows = sql_result["rows"]

        chart = build_chart(rows)

        # Save the result as a pinned insight for the dashboard.
        insight = Insight(
            id=f"insight_{datetime.utcnow().timestamp()}",
            title=question,
            summary=data.get("answer"),
            chart_or_table_ref=chart or {},
            sql=sql,
            created_at=datetime.utcnow(),
        )
        pinned_insights.append(insight)

        return {
            "answer": data.get("answer"),
            "detail": {"chart": chart, "table": rows},
            "sql": sql,
            "notes": data.get("notes"),
            "next_steps": data.get("next_steps", []),
        }

    except Exception as e:
        logger.exception("Error processing question")
        return {
            "answer": "Sorry, something went wrong while answering that question.",
            "detail": {},
            "sql": "",
            "notes": str(e),
            "next_steps": [],
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)