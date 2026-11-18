import os
import sys
import uvicorn

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("=" * 65)
    print("  DarGlobal & Wasalt Real Estate AI Assistant")
    print("=" * 65)
    print(f"  Starting local server on: http://localhost:{port}")
    print(f"  API Docs available at:    http://localhost:{port}/docs")
    print(f"  Health Check endpoint:    http://localhost:{port}/api/health")
    print("=" * 65)
    
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
