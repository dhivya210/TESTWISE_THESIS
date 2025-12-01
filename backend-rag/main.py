"""
Simple entry point for RAG Backend
Run with: python main.py
"""
import os
import uvicorn
from dotenv import load_dotenv

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    port = int(os.getenv("PORT", 8000))
    print(f"\n🚀 Starting RAG Backend on http://localhost:{port}\n")
    
    # Use import string format for reload to work properly
    # This tells uvicorn to import from src/main.py
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_dirs=["src"]
    )

