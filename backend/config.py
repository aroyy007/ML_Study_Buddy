# ML RAG System Backend - Configuration
import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List

@dataclass
class Config:
    """Central configuration for the ML RAG System."""
    groq_api_key: str = ""
    huggingface_api_key: str = ""
    llm_model: str = "llama-3.3-70b-versatile"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 5
    knowledge_base_dir: str = "./knowledge_base"
    faiss_index_path: str = "./faiss_index"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            groq_api_key=os.getenv("GROQ_API_KEY", ""),
            huggingface_api_key=os.getenv("HUGGINGFACE_API_KEY", ""),
            llm_model=os.getenv("LLM_MODEL", "llama-3.3-70b-versatile"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
            chunk_size=int(os.getenv("CHUNK_SIZE", "1000")),
            chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "200")),
            top_k_results=int(os.getenv("TOP_K_RESULTS", "5")),
            faiss_index_path = os.getenv("FAISS_INDEX_PATH", "./faiss_index"),
            api_host=os.getenv("API_HOST", "0.0.0.0"),
            api_port=int(os.getenv("API_PORT", "8000")),
        )

    def validate(self):
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY is required")
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")
        if self.api_port < 1 or self.api_port > 65535:
            raise ValueError("api_port must be between 1 and 65535")

    def ensure_directories(self):
        Path(self.knowledge_base_dir).mkdir(parents=True, exist_ok=True)
        Path(self.faiss_index_path).parent.mkdir(parents=True, exist_ok=True)

# Global config instance
config = Config.from_env()
