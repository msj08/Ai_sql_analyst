# Agentic SQL Data Analyst & BI Dashboard

An autonomous AI-powered data analyst that understands natural language questions, queries databases, and provides insights with visualizations.

## Overview

This application implements an AI agent that:
- Understands business questions in plain English
- Inspects database schema to understand available data
- Generates and executes safe SQL queries
- Interprets results and provides narrative insights
- Creates visualizations and dashboards
- Learns from interactions and maintains a persistent dashboard

## Architecture

### Backend (Python/FastAPI)
- **API Layer**: RESTful endpoints for agent tools and chat interface
- **Agent Core**: Implements the agentic SQL analyst logic with tool calling
- **Database Layer**: Async PostgreSQL connection pool
- **Tool Functions**: Database introspection, query execution, chart rendering

### Frontend (React/Material-UI)
- **Chat Interface**: Conversational interface for asking questions
- **Dashboard**: Persistent pinned insights with charts and tables
- **Visualizations**: Using Recharts for data visualization
- **State Management**: React hooks for UI state

### Agent Tools
The agent has access to these tools:
- `list_tables()`: Get available tables
- `get_schema(table_name)`: Get table schema details
- `sample_rows(table_name, limit)`: Preview table data
- `run_sql(query, read_only)`: Execute SQL queries safely
- `explain_query(query)`: Get query execution plan
- `render_chart(chart_spec)`: Generate chart specifications
- `pin_insight(title, summary, chart/table, sql)`: Save insights to dashboard

## Setup Instructions

### Prerequisites
- Node.js 16+
- Python 3.8+
- PostgreSQL (for production data)
- Anthropic API key (for Claude LLM)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Sample Data Setup (Optional)

If you want to use the sample e-commerce database:

```bash
# Create sample database
createdb analytics_demo

# Run the sample data generator
python backend/sample_data_generator.py

# Or manually create tables and insert sample data
# See backend/sample_data.sql for schema and sample data
```

### 4. Run the Application

Start the backend:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Backend API: http://localhost:8000
- Frontend UI: http://localhost:3000

## Usage Examples

Try asking questions like:
- "What was revenue by month for the last 6 months?"
- "Who are our best customers by lifetime value customers?"
- "Show me sales by product category"
- "What's our monthly refund rate?"

The agent will:
1. Understand your question
2. Explore the database schema
3. Generate appropriate SQL
4. Execute and validate the query
5. Provide insights with visualizations
6. Suggest follow-up questions

## Key Features

### Safety Constraints
- Default read-only database access
- SQL injection prevention
- Query execution limits
- No PII exposure without explicit request
- Audit logging of all SQL statements

### Agent Behavior
- Uses CTEs for complex queries
- Explicit column selection (no SELECT *)
- Inline comments for business logic
- Automatic chart selection based on data type
- Result validation (totals, NULL checks, join integrity)
- Clear assumptions stated for ambiguous queries

### Dashboard Features
- Persistent pinned insights
- Responsive grid layout
- Collapsible SQL queries
- Chart previews
- One-click unpins
- KPI cards, charts, and tables

## Architecture Decisions

### Technology Choices
- **FastAPI**: High-performance Python framework with built-in OpenAPI docs
- **React**: Popular frontend library with rich ecosystem
- **Material-UI**: Consistent, accessible UI components
- **Recharts**: Flexible charting library built on D3
- **AsyncPG**: High-performance PostgreSQL async driver

### Agent Design
- **Tool-Based Architecture**: Each capability is an explicit tool
- **Explicit Reasoning**: Agent shows its work (SQL, assumptions, next steps)
- **Safety First**: Read-only by default, explicit opt-in for writes
- **Extensible Design**: Easy to add new tools or change LLM providers

### Data Flow
1. User asks question in chat
2. Backend receives message at `/chat` endpoint
3. Agent processes question using available tools
4. Agent may call multiple tools in sequence (schema → sample → SQL → chart)
5. Results returned to frontend with explanation
6. User can pin insights to dashboard
7. Dashboard persists insights across sessions

## Limitations & Future Improvements

### Current Limitations
- Demo mode uses mock data when no database connected
- Limited to predefined query patterns in this demo
- Basic error handling and recovery
- No user authentication or multi-tenancy
- Chart rendering simplified in demo

### Planned Enhancements
1. **Full LLM Integration**: Replace rule-based agent with Claude function calling
2. **Advanced Visualizations**: More chart types and customization options
3. **Export Capabilities**: CSV/PDF export of insights and dashboards
4. **Scheduled Reports**: Automated insight generation and delivery
5. **Query History**: Searchable history of past questions and answers
6. **Collaboration Features**: Sharing insights and dashboards with team members
7. **Performance Optimization**: Query caching and result pagination
8. **Advanced Analytics**: Statistical functions, forecasting, anomaly detection

## Files Overview

```
backend/
├── main.py              # FastAPI application with agent logic
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create this)
├── sample_data.sql      # Sample database schema and data
└── sample_data_generator.py  # Script to generate sample data

frontend/
├── package.json         # Node.js dependencies
├── src/
│   ├── index.js         # React entry point
│   ├── App.js           # Main application component
│   ├── index.css        # Global styles
│   └── components/      # Reusable components (if expanded)
```

## Troubleshooting

### Backend Connection Issues
- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running and accessible
- Check firewall/network settings

### Frontend Proxy Issues
- The frontend is configured to proxy API requests to localhost:8000
- If you change the backend port, update `proxy` in frontend/package.json

### Sample Data Generation
If you encounter issues with the sample data generator:
1. Check PostgreSQL connection parameters
2. Ensure the database exists before running
3. Verify you have sufficient privileges to create tables

## License

MIT License - feel free to use, modify, and distribute this application.

---
Built with ❤️ using Anthropic Claude as the AI agent engine.