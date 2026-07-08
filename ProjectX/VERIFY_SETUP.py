#!/usr/bin/env python3
"""
Verification script to check that all required files are present
"""
import os
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and report status"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ MISSING {description}: {filepath}")
        return False

def main():
    print("🔍 Verifying Athena SQL Data Analyst Setup")
    print("=" * 50)

    base_path = Path(__file__).parent
    all_good = True

    # Backend files
    backend_files = [
        ("backend/main.py", "Main FastAPI application"),
        ("backend/requirements.txt", "Python dependencies"),
        ("backend/seed_data.sql", "Sample database schema and data"),
        ("backend/sample_data_generator.py", "Sample data generator script"),
        ("backend/test_connection.py", "Database connection test"),
        ("backend/agent_system_prompt.md", "Agent system prompt and instructions"),
    ]

    # Frontend files
    frontend_files = [
        ("frontend/package.json", "Node.js dependencies and scripts"),
        ("frontend/src/index.js", "React entry point"),
        ("frontend/src/App.js", "Main React application component"),
        ("frontend/src/index.css", "Global CSS styles"),
    ]

    # Root files
    root_files = [
        ("README.md", "Project documentation"),
        (".env.example", "Example environment variables (optional)"),
    ]

    print("📁 Checking Backend Files:")
    for filepath, description in backend_files:
        if not check_file_exists(str(base_path / filepath), description):
            all_good = False

    print("\n📁 Checking Frontend Files:")
    for filepath, description in frontend_files:
        if not check_file_exists(str(base_path / filepath), description):
            all_good = False

    print("\n📁 Checking Root Files:")
    for filepath, description in root_files:
        if not check_file_exists(str(base_path / filepath), description):
            # Root files are optional
            pass

    print("\n" + "=" * 50)
    if all_good:
        print("🎉 All core files are present!")
        print("\nNext steps:")
        print("1. Copy .env.example to .env and configure your database")
        print("2. Install backend dependencies: cd backend && pip install -r requirements.txt")
        print("3. Install frontend dependencies: cd frontend && npm install")
        print("4. Start the backend: cd backend && uvicorn main:app --reload")
        print("5. Start the frontend: cd frontend && npm start")
        print("6. Visit http://localhost:3000 to use the application")
    else:
        print("❌ Some required files are missing. Please check the output above.")

    return all_good

if __name__ == "__main__":
    main()