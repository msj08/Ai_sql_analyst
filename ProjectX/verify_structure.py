#!/usr/bin/env python3
"""
Simple verification script to check application structure
"""
import os
import sys

def test_imports():
    """Test that we can import the backend modules"""
    try:
        # Add backend to path
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

        # Try importing main components
        import main
        print("[OK] Main module imports successfully")

        # Check if we can access the FastAPI app
        from main import app
        print("[OK] FastAPI app object accessible")

        return True
    except Exception as e:
        print(f"[ERROR] Import error: {e}")
        return False

def test_file_structure():
    """Test that all expected files exist"""
    base_dir = os.path.dirname(__file__)
    required_files = [
        'backend/main.py',
        'backend/requirements.txt',
        'backend/seed_data.sql',
        'backend/sample_data_generator.py',
        'backend/agent_system_prompt.md',
        'frontend/package.json',
        'frontend/src/index.js',
        'frontend/src/App.js',
        'frontend/src/index.css',
        'README.md'
    ]

    missing = []
    for file_path in required_files:
        full_path = os.path.join(base_dir, file_path)
        if not os.path.exists(full_path):
            missing.append(file_path)

    if missing:
        print(f"[ERROR] Missing files: {missing}")
        return False
    else:
        print("[OK] All required files present")
        return True

def test_requirements():
    """Check that requirements.txt has expected content"""
    try:
        req_path = os.path.join(os.path.dirname(__file__), 'backend', 'requirements.txt')
        with open(req_path, 'r') as f:
            content = f.read()

        required_packages = ['fastapi', 'uvicorn', 'asyncpg', 'python-dotenv']
        missing = []

        for package in required_packages:
            if package not in content.lower():
                missing.append(package)

        if missing:
            print(f"[WARNING] Missing packages in requirements.txt: {missing}")
            return False
        else:
            print("[OK] Requirements.txt contains expected packages")
            return True
    except Exception as e:
        print(f"[ERROR] Error reading requirements.txt: {e}")
        return False

def main():
    print("Verifying Athena SQL Data Analyst Application Structure")
    print("=" * 60)

    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    tests = [
        ("File Structure", test_file_structure),
        ("Requirements", test_requirements),
        ("Imports", test_imports),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        try:
            result = test_func()
            results.append(result)
            if result:
                print(f"  [PASS] {test_name} passed")
            else:
                print(f"  [FAIL] {test_name} failed")
        except Exception as e:
            print(f"  [ERROR] {test_name} error: {e}")
            results.append(False)

    print("\n" + "=" * 60)
    if all(results):
        print("SUCCESS: ALL CHECKS PASSED!")
        print("\nThe application structure is ready.")
        print("\nNext steps:")
        print("1. Install anthropic package: pip install anthropic")
        print("2. Install frontend dependencies: cd frontend && npm install")
        print("3. Create .env file with API keys and database connection")
        print("4. Run the application:")
        print("   Backend: cd backend && uvicorn main:app --reload")
        print("   Frontend: cd frontend && npm start")
        return 0
    else:
        print("FAILURE: SOME CHECKS FAILED")
        print("Please review the output above and fix any issues.")
        return 1

if __name__ == "__main__":
    sys.exit(main())