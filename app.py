"""
ML Study Buddy - Hugging Face Spaces FastAPI Backend
This creates a REST API that your Next.js frontend can call.
"""
import os
import sys
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from config import config
from rag import VectorStoreManager, RAGChain

# Global instances
vector_store: Optional[VectorStoreManager] = None
rag_chain: Optional[RAGChain] = None


# --- Pydantic Models ---

class QueryRequest(BaseModel):
    question: str
    session_id: str = "default"

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

class HealthResponse(BaseModel):
    status: str
    document_count: int
    index_loaded: bool

class TranscribeResponse(BaseModel):
    transcription: str

class VoiceQueryResponse(BaseModel):
    text_response: str
    sources: List[str]
    transcribed_question: str
    audio_url: Optional[str] = None

class ImageQueryResponse(BaseModel):
    answer: str
    sources: List[str]
    extracted_text: str

class UploadResponse(BaseModel):
    message: str
    filename: str
    chunks_added: int


# --- Startup/Shutdown ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG system on startup."""
    global vector_store, rag_chain
    
    print("🚀 Starting ML Study Buddy on Hugging Face Spaces...")
    
    # Configure from environment
    config.groq_api_key = os.getenv("GROQ_API_KEY", "")
    config.faiss_index_path = "./faiss_index"
    
    if not config.groq_api_key:
        print("⚠️ GROQ_API_KEY not set!")
    else:
        print("✅ Groq API key configured")
    
    # Initialize vector store (lazy load embeddings)
    vector_store = VectorStoreManager(
        embedding_model=config.embedding_model,
        index_path=config.faiss_index_path
    )
    
    # Check if index exists
    index_file = Path(config.faiss_index_path) / "index.faiss"
    if index_file.exists():
        print(f"📊 Index file found, will load on first query")
    else:
        print("⚠️ No existing index found. Upload documents to build knowledge base.")
    
    print("✅ Backend ready!")
    
    yield
    
    print("👋 Shutting down...")


# --- FastAPI App ---

app = FastAPI(
    title="ML Study Buddy API",
    description="RAG-based Q&A system for machine learning topics using Llama 3.3 70B",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow frontend origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
if ALLOWED_ORIGINS == ["*"]:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "https://*.vercel.app",
        "*"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helper Function ---

def ensure_rag_initialized():
    """Lazy initialization of RAG chain."""
    global rag_chain
    
    if vector_store is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # Load index on first use
    if not vector_store.is_loaded:
        print("🔄 Loading index on first query...")
        if not vector_store.load_index():
            raise HTTPException(status_code=503, detail="No index available. Upload documents first.")
        print(f"✅ Loaded {vector_store.get_document_count()} documents")
    
    # Initialize RAG chain on first use
    if rag_chain is None:
        if not config.groq_api_key:
            raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")
        
        retriever = vector_store.get_retriever({"k": config.top_k_results})
        rag_chain = RAGChain(
            llm_model=config.llm_model,
            retriever=retriever,
            groq_api_key=config.groq_api_key
        )
        print("✅ RAG chain initialized")


# --- API Endpoints ---

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": "ML Study Buddy API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check system health and status."""
    has_index = False
    doc_count = 0
    
    if vector_store:
        index_file = Path(config.faiss_index_path) / "index.faiss"
        has_index = index_file.exists()
        if vector_store.is_loaded:
            doc_count = vector_store.get_document_count()
    
    return HealthResponse(
        status="healthy" if has_index else "no_index",
        document_count=doc_count,
        index_loaded=vector_store.is_loaded if vector_store else False
    )


@app.post("/query", response_model=QueryResponse, tags=["Query"])
async def query_endpoint(request: QueryRequest):
    """Query the RAG system with a text question."""
    ensure_rag_initialized()
    
    if not request.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty")
    
    try:
        response = rag_chain.query(request.question, request.session_id)
        return QueryResponse(
            answer=response.answer,
            sources=response.sources
        )
    except Exception as e:
        print(f"❌ Query error: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/query-image", response_model=ImageQueryResponse, tags=["Query"])
async def query_image_endpoint(
    image: UploadFile = File(...),
    question: str = "",
    session_id: str = "default"
):
    """
    Query the RAG system using an image.
    1. Extract text from image using OCR
    2. Combine with user's question
    3. Query the RAG system
    """
    ensure_rag_initialized()
    
    # Lazy import OCR
    from ocr import get_ocr
    
    # Check file format
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'}
    file_ext = Path(image.filename).suffix.lower() if image.filename else ''
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read image content
        content = await image.read()
        
        # Extract text from image using OCR
        ocr = get_ocr()
        extracted_text = ocr.extract_text_from_bytes(content)
        
        if not extracted_text and not question:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from image and no question provided"
            )
        
        # Build the query
        if question and extracted_text:
            combined_query = f"Based on this text extracted from an image: '{extracted_text}'\n\nUser question: {question}"
        elif extracted_text:
            combined_query = f"Explain and provide information about this text from an image: {extracted_text}"
        else:
            combined_query = question
        
        # Query RAG system
        response = rag_chain.query(combined_query, session_id)
        
        return ImageQueryResponse(
            answer=response.answer,
            sources=response.sources,
            extracted_text=extracted_text
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image query error: {str(e)}")


@app.post("/transcribe", response_model=TranscribeResponse, tags=["Voice"])
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio file to text using Whisper."""
    from voice import SpeechToText
    
    temp_path = f"temp_audio_{audio.filename}"
    try:
        content = await audio.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        stt = SpeechToText()
        transcription = stt.transcribe(temp_path)
        
        return TranscribeResponse(transcription=transcription)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/voice-query", response_model=VoiceQueryResponse, tags=["Voice"])
async def voice_query_endpoint(
    audio: UploadFile = File(...),
    session_id: str = "voice",
    generate_audio: bool = True
):
    """Process voice query: transcribe → query RAG → generate audio response."""
    ensure_rag_initialized()
    
    from voice import VoiceRAGHandler
    
    audio_path = f"temp_audio_{session_id}.wav"
    try:
        content = await audio.read()
        with open(audio_path, "wb") as f:
            f.write(content)
        
        handler = VoiceRAGHandler(rag_chain)
        response = handler.process_voice_query(audio_path, session_id, generate_audio)
        
        audio_url = None
        if response.audio_path and os.path.exists(response.audio_path):
            audio_url = f"/audio/{os.path.basename(response.audio_path)}"
        
        return VoiceQueryResponse(
            text_response=response.text_response,
            sources=response.sources,
            transcribed_question=response.transcribed_question,
            audio_url=audio_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice query error: {str(e)}")
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


@app.get("/audio/{filename}", tags=["Voice"])
async def get_audio(filename: str):
    """Serve generated audio files."""
    file_path = Path(filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/wav")


@app.delete("/session/{session_id}", tags=["Session"])
async def clear_session(session_id: str):
    """Clear chat session history."""
    if rag_chain:
        rag_chain.clear_session(session_id)
    return {"message": f"Session {session_id} cleared"}


@app.post("/upload", response_model=UploadResponse, tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF document."""
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    from langchain_community.document_loaders import PyMuPDFLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    
    temp_path = f"temp_{file.filename}"
    try:
        # Save uploaded file
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Load and split document
        loader = PyMuPDFLoader(temp_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap
        )
        chunks = text_splitter.split_documents(documents)
        
        # Add to vector store
        count = vector_store.add_documents(chunks)
        vector_store.save_index()
        
        return UploadResponse(
            message="Document processed successfully",
            filename=file.filename,
            chunks_added=count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# --- Run with Uvicorn ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=7860,  # HF Spaces uses port 7860
        log_level="info"
    )
