# ML RAG System - FastAPI Backend
import os
import sys
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

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

class UploadResponse(BaseModel):
    message: str
    filename: str
    chunks_added: int

class TranscribeResponse(BaseModel):
    transcription: str

class VoiceQueryResponse(BaseModel):
    text_response: str
    sources: List[str]
    transcribed_question: str
    audio_url: Optional[str] = None

# --- Startup/Shutdown ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG system on startup."""
    global vector_store, rag_chain
    
    print("🚀 Starting ML RAG System...")
    print(f"📁 FAISS Index Path: {config.faiss_index_path}")
    
    # Load configuration
    if not config.groq_api_key:
        print("⚠️ GROQ_API_KEY not set. Please set it in environment variables.")
    else:
        print("✅ Groq API key configured")
    
    # Initialize vector store and RAG chain in background to not block startup
    import asyncio
    
    async def init_rag():
        global vector_store, rag_chain
        try:
            # Initialize vector store
            vector_store = VectorStoreManager(
                embedding_model=config.embedding_model,
                index_path=config.faiss_index_path
            )
            
            # Load existing index
            if vector_store.load_index():
                print(f"📊 Loaded {vector_store.get_document_count()} documents from index")
                
                # Initialize RAG chain
                if config.groq_api_key:
                    retriever = vector_store.get_retriever({"k": config.top_k_results})
                    rag_chain = RAGChain(
                        llm_model=config.llm_model,
                        retriever=retriever,
                        groq_api_key=config.groq_api_key
                    )
                    print("✅ RAG chain initialized!")
            else:
                print("⚠️ No existing index found. Upload documents to build the knowledge base.")
        except Exception as e:
            print(f"❌ Error initializing RAG: {e}")
    
    # Start initialization in background
    asyncio.create_task(init_rag())
    
    yield
    
    # Cleanup
    print("👋 Shutting down ML RAG System...")

# --- FastAPI App ---

app = FastAPI(
    title="ML RAG System API",
    description="RAG-based Q&A system for machine learning topics using Llama 3.3 70B",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check system health and status."""
    return HealthResponse(
        status="healthy" if vector_store and vector_store.is_loaded else "no_index",
        document_count=vector_store.get_document_count() if vector_store else 0,
        index_loaded=vector_store.is_loaded if vector_store else False
    )

@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    """Query the RAG system with a text question."""
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized. Check if GROQ_API_KEY is set and index is loaded.")
    
    if not request.question.strip():
        raise HTTPException(status_code=422, detail="Question cannot be empty")
    
    try:
        response = rag_chain.query(request.question, request.session_id)
        return QueryResponse(answer=response.answer, sources=response.sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio file to text using Whisper."""
    # Lazy import to avoid loading models at startup
    from voice import SpeechToText
    
    # Save uploaded file temporarily
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

@app.post("/voice-query", response_model=VoiceQueryResponse)
async def voice_query_endpoint(
    audio: UploadFile = File(...),
    session_id: str = "voice",
    generate_audio: bool = True
):
    """Process voice query: transcribe, query RAG, optionally generate audio response."""
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized")
    
    # Lazy import
    from voice import VoiceRAGHandler
    
    # Save uploaded audio
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

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated audio files."""
    file_path = Path(filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path, media_type="audio/wav")

@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear chat session history."""
    if rag_chain:
        rag_chain.clear_session(session_id)
    return {"message": f"Session {session_id} cleared"}

# --- Image Query Endpoint ---

class ImageQueryResponse(BaseModel):
    answer: str
    sources: List[str]
    extracted_text: str

@app.post("/query-image", response_model=ImageQueryResponse)
async def query_image_endpoint(
    image: UploadFile = File(...),
    question: str = "",
    session_id: str = "default"
):
    """
    Query the RAG system using an image.
    
    1. Extract text from the image using OCR
    2. Combine extracted text with user's question (if provided)
    3. Query the RAG system
    4. Return the answer with sources and extracted text
    """
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized")
    
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
        
        # Build the query combining extracted text and user question
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

# --- Main ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.api_host,
        port=config.api_port,
        reload=True
    )

