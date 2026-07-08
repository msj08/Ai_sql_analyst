import re

with open(r'D:\ProjectX\backend\\main.py', 'r') as f:
    content = f.read()

# Pattern to find the function from def to just before if __name__ == '__main__':
# We'll match from the function definition line up to the line before "if __name__ == \"__main__\":"
# Using DOTALL to match across lines.
pattern = r'(async def process_user_question\(question: str, session_id=None\):.*?)(?=\nif __name__ == \"__main__\":\n)'
# Replace with the corrected function
new_func = '''async def process_user_question(question: str, session_id=None):
    logger.info(question)

    prompt = f\"\"\"
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

    {
        \"answer\":\"...",
        \"sql\":\"...",
        \"notes\":\"...",
        \"next_steps\":[]
    }
    \"\"\"

    try:

        print(\"STEP 1 - process_user_question called\")

        print(\"STEP 2 - Prompt created\")

        response = model.generate_content(prompt)

        print(\"STEP 3 - Gemini responded\")

        print(\"========== GEMINI RAW RESPONSE ==========\")
        print(response.text)
        print(\"=========================================\")

        text = response.text
        text = text.replace(\"```json\", \"\").replace(\"```\", \"\").strip()

        data = json.loads(text)

        sql = (data.get(\"sql\") or \"\").strip()

        # Don't execute SQL if Gemini didn't generate any
        if not sql:
            return {
                \"answer\": data.get(\"answer\"),
                \"detail\": {},
                \"sql\": \"\",
                \"notes\": data.get(\"notes\"),
                \"next_steps\": data.get(\"next_steps\", [])
            }

        ####################################################
        # Execute SQL
        ####################################################

        sql_result = await run_sql(
            SQLQueryRequest(
                query=sql,
                read_only=True
            )
        )

        rows = sql_result[\"rows\"]

        ####################################################
        # Build Chart
        ####################################################

        chart = build_chart(rows)

        ####################################################
        # Save Insight
        ####################################################

        insight = Insight(
            id=f\"insight_{datetime.utcnow().timestamp()}\",
            title=question,
            summary=data.get(\"answer\"),
            chart_or_table_ref=chart,
            sql=sql,
            created_at=datetime.utcnow()
        )

        pinned_insights.append(insight)

        ####################################################
        # Return Response
        ####################################################

        return {
            \"answer\": data.get(\"answer\"),
            \"detail\": {
                \"chart\": chart,
                \"table\": rows
            },
            \"sql\": sql,
            \"notes\": data.get(\"notes\"),
            \"next_steps\": data.get(\"next_steps\", [])
        }

    except Exception as e:

        logger.exception(e)

        return {
            \"answer\": str(e),
            \"detail\": {},
            \"sql\": \"\",
            \"notes\": \"\",
            \"next_steps\": []
        }'''

# Perform replacement
new_content = re.sub(pattern, new_func, content, flags=re.DOTALL)

with open(r'D:\ProjectX\backend\\main.py', 'w') as f:
    f.write(new_content)