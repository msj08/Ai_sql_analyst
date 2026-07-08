import sys

def main():
    file_path = sys.argv[1]
    with open(file_path, 'r') as f:
        lines = f.readlines()

    func_def_line = "async def process_user_question(question: str, session_id=None):"
    main_guard_line = "if __name__ == \"__main__\":"

    # Find the function definition line
    func_def_index = -1
    for i, line in enumerate(lines):
        if line.rstrip() == func_def_line:
            func_def_index = i
            break

    if func_def_index == -1:
        print("Function definition not found")
        sys.exit(1)

    # Find the main guard line
    main_index = -1
    for i, line in enumerate(lines):
        if line.rstrip() == main_guard_line:
            main_index = i
            break

    if main_index == -1:
        print("Main guard not found")
        sys.exit(1)

    # Build the new function body lines
    new_function_body = [
        "    logger.info(question)",
        "",
        "    prompt = f'''You are Athena, an SQL expert.",
        "",
        "Database:",
        "",
        "customers(id,name,signup_date,region,segment)",
        "",
        "orders(id,customer_id,order_date,status,channel)",
        "",
        "order_items(id,order_id,product_id,quantity,unit_price)",
        "",
        "products(id,name,category,cost)",
        "",
        "refunds(id,order_id,refund_date,amount,reason)",
        "",
        "User Question:",
        "",
        "{question}",
        "",
        "Return ONLY JSON.",
        "",
        "{",
        "    \"answer\":\"...\",",
        "    \"sql\":\"...\",",
        "    \"notes\":\"...\",",
        "    \"next_steps\":[]",
        "}",
        "    '''",
        "",
        "    try:",
        "        print(\"STEP 1 - process_user_question called\")",
        "        print(\"STEP 2 - Prompt created\")",
        "        response = model.generate_content(prompt)",
        "        print(\"STEP 3 - Gemini responded\")",
        "        print(\"========== GEMINI RAW RESPONSE ==========")",
        "        print(response.text)",
        "        print(\"=========================================\")",
        "        text = response.text",
        "        text = text.replace(\"```json\", \"\").replace(\"```\", \"\").strip()",
        "        data = json.loads(text)",
        "        sql = (data.get(\"sql\") or \"\").strip()",
        "        if not sql:",
        "            return {",
            "                \"answer\": data.get(\"answer\"),",
            "                \"detail\": {},",
            "                \"sql\": \"\",",
            "                \"notes\": data.get(\"notes\"),",
            "                \"next_steps\": data.get(\"next_steps\", [])",
            "            }",
        "        ####################################################",
        "        # Execute SQL",
        "        ####################################################",
        "        sql_result = await run_sql(",
            "            SQLQueryRequest(",
                "                query=sql,",
                "                read_only=True",
            "            )",
        "        )",
        "        rows = sql_result[\"rows\"]",
        "        ####################################################",
        "        # Build Chart",
        "        ####################################################",
        "        chart = build_chart(rows)",
        "        ####################################################",
        "        # Save Insight",
        "        ####################################################",
        "        insight = Insight(",
            "            id=f\"insight_{datetime.utcnow().timestamp()}\",",
            "            title=question,",
            "            summary=data.get(\"answer\"),",
            "            chart_or_table_ref=chart,",
            "            sql=sql,",
            "            created_at=datetime.utcnow()",
        "        )",
        "        pinned_insights.append(insight)",
        "        ####################################################",
        "        # Return Response",
        "        ####################################################",
        "        return {",
            "            \"answer\": data.get(\"answer\"),",
            "            \"detail\": {",
            "                \"chart\": chart,",
            "                \"table\": rows",
            "            },",
            "            \"sql\": sql,",
            "            \"notes\": data.get(\"notes\"),",
            "            \"next_steps\": data.get(\"next_steps\", [])",
        "        }",
        "    except Exception as e:",
        "        logger.exception(e)",
        "        return {",
            "            \"answer\": str(e),",
            "            \"detail\": {},",
            "            \"sql\": \"\",",
            "            \"notes\": \"\",",
            "            \"next_steps\": []",
        "        }"
    ]

    # Now, create the new lines
    new_lines = lines[0:func_def_index+1]   # up to and including the function definition
    new_lines.extend(new_function_body)
    new_lines.extend(lines[main_index-1:])   # from the blank line before the if __name__ to the end

    with open(file_path, 'w') as f:
        f.writelines(new_lines)

    if __name__ == '__main__':
        main()