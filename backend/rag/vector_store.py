# FAISS Vector Store Manager
from pathlib import Path
from typing import List, Optional, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

class VectorStoreError(Exception):
    pass

class VectorStoreManager:
    """Manages FAISS vector store for document embeddings."""

    def __init__(self, embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2", index_path: str = "./faiss_index"):
        self.embedding_model_name = embedding_model
        self.index_path = Path(index_path)
        self._embeddings = None
        self._vector_store = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            print("🔄 Loading embedding model...")
            self._embeddings = HuggingFaceEmbeddings(
                model_name=self.embedding_model_name,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            print("✅ Embedding model loaded")
        return self._embeddings

    @property
    def is_loaded(self) -> bool:
        return self._vector_store is not None

    def load_index(self) -> bool:
        index_file = self.index_path / "index.faiss"
        if not index_file.exists():
            print(f"❌ Index file not found at {index_file}")
            return False
        try:
            self._vector_store = FAISS.load_local(str(self.index_path), self.embeddings, allow_dangerous_deserialization=True)
            print(f"✅ Loaded index with {self.get_document_count()} documents")
            return True
        except Exception as e:
            print(f"❌ Failed to load index: {e}")
            return False

    def save_index(self):
        if self._vector_store is None:
            raise VectorStoreError("No index to save")
        self.index_path.mkdir(parents=True, exist_ok=True)
        self._vector_store.save_local(str(self.index_path))
        print(f"✅ Saved index to {self.index_path}")

    def add_documents(self, documents: List[Document]) -> int:
        if not documents:
            return 0
        if self._vector_store is None:
            self._vector_store = FAISS.from_documents(documents, self.embeddings)
        else:
            self._vector_store.add_documents(documents)
        print(f"✅ Added {len(documents)} documents to index")
        return len(documents)

    def search(self, query: str, top_k: int = 5) -> List[Document]:
        if self._vector_store is None:
            raise VectorStoreError("No index loaded")
        if not query or not query.strip():
            return []
        return self._vector_store.similarity_search(query, k=min(top_k, self.get_document_count()))

    def get_document_count(self) -> int:
        return self._vector_store.index.ntotal if self._vector_store else 0

    def get_retriever(self, search_kwargs: dict = None):
        if self._vector_store is None:
            raise VectorStoreError("No index loaded")
        return self._vector_store.as_retriever(search_kwargs=search_kwargs or {"k": 5})
