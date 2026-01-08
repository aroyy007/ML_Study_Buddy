#!/usr/bin/env python3
"""Run the ML RAG System backend server."""

import os
import sys
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    import uvicorn
    from config import config
    
    print("=" * 60)
    print("ML RAG System Backend")
    print("=" * 60)
    print(f"FAISS Index: {config.faiss_index_path}")
    print(f"LLM Model: {config.llm_model}")
    print(f"API URL: http://{config.api_host}:{config.api_port}")
    print("=" * 60)

    
    # Use reload only in development
    import os
    is_production = os.getenv("PRODUCTION", False)
    
    uvicorn.run(
        "main:app",
        host=config.api_host,
        port=config.api_port,
        reload=not is_production,
        log_level="info"
    )
