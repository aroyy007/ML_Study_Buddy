---
title: ML Study Buddy API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# ML Study Buddy API

A RAG-based Q&A system for machine learning topics using Llama 3.3 70B.

## Features

- 📚 **Text Query**: Ask ML questions and get AI-powered answers
- 🎤 **Voice Query**: Upload audio files for transcription and Q&A
- 📷 **Image Query**: Upload images for OCR and Q&A
- 📁 **Document Upload**: Add PDFs to the knowledge base

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check |
| `/query` | POST | Text-based RAG query |
| `/query-image` | POST | Image OCR + RAG query |
| `/transcribe` | POST | Audio transcription |
| `/voice-query` | POST | Voice-based RAG query |
| `/upload` | POST | Upload PDF documents |

## Usage

Access the API docs at `/docs` or `/redoc`.

### Example Query
```bash
curl -X POST "https://YOUR-SPACE.hf.space/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is gradient descent?", "session_id": "user123"}'
```

## Environment Variables

Set these in Space Settings → Repository secrets:
- `GROQ_API_KEY` - Required for LLM access

## Models Used

- **LLM**: Llama 3.3 70B (Groq)
- **Embeddings**: all-MiniLM-L6-v2
- **STT**: Whisper Small
- **TTS**: SpeechT5
- **OCR**: TrOCR Base
