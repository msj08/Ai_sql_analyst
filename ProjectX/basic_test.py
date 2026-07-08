#!/usr/bin/env python3
"""
Basic test to verify the application structure works
"""
import sys
import os

def test_imports():
    """Test that we can import the main modules"""
    try:
        # Add backend to path
        sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

        # Test importing our main modules
        import main
        print("Main module imports successfully")

        # Test that we can create the app
        from main import app
        print("FastAPI app object created successfully")

        # Test Pydantic models
        from main import ChatMessage, SQLQueryRequest, ChartSpec, Insight
        print("Pydantic models imported successfully")

        return True

    except Exception as e:
        print(f"Import error: {e}")
        return False

def test_file_structure():
    """Test that all expected files exist"""
    base_dir = os.path.dirname(__file__)
    required_files = [
        'backend/main.py',
        'backend/requirements.txt',
        'backend/seed_data.sql',
        'frontend/package.json',
        'frontend/src/index.js',
        'frontend/src/App.js',
        'README.md'
    ]

    missing = []
    for file_path in required_files:
        full_path = os.path.join(base_dir, file_path)
        if not os.path.exists(full_path):
            missing.append(file_path)

    if missing:
        print(f"Missing files: {missing}")
        return False
    else:
        print("All required files present")
        return True

if __name__ == "__main__":
    print("Running basic application tests...")
    print("=" * 50)

    imports_ok = test_imports()
    files_ok = test_file_structure()

    print("=" * 50)
    if imports_ok and files_ok:
        print("Basic structure tests passed!")
        print("The application structure is ready.")
        print("\nTo complete setup:")
        print("1. Install anthropic package: pip install anthropic")
        print("2. Install frontend deps: cd frontend && npm install")
        print("3. Configure .env file with API keys and DB connection")
        print("4. Run the application")
    else:
        print("Some tests failed. Please check the output above.")
        sys.exit(1)