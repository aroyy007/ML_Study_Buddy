# Voice RAG Handler
from dataclasses import dataclass
from typing import List, Optional
from .stt import SpeechToText
from .tts import TextToSpeech

@dataclass
class VoiceResponse:
    text_response: str
    audio_path: Optional[str]
    sources: List[str]
    transcribed_question: str = ""

class VoiceRAGHandler:
    """Orchestrates voice-based RAG queries."""

    def __init__(self, rag_chain_instance):
        self.rag_chain = rag_chain_instance
        self.stt = SpeechToText()
        self.tts = TextToSpeech()

    def process_voice_query(self, audio_path: str, session_id: str = "voice", generate_audio: bool = True) -> VoiceResponse:
        print("🎤 Transcribing audio...")
        transcribed_text = self.stt.transcribe(audio_path)
        print(f"📝 Transcribed: {transcribed_text}")

        print("🤔 Processing query...")
        rag_response = self.rag_chain.query(transcribed_text, session_id)

        audio_output = None
        if generate_audio:
            print("🔊 Generating audio response...")
            # Limit text for TTS
            speak_text = rag_response.answer[:500] + '...' if len(rag_response.answer) > 500 else rag_response.answer
            audio_output = self.tts.synthesize(speak_text, f"response_{session_id}.wav")

        return VoiceResponse(
            text_response=rag_response.answer,
            audio_path=audio_output,
            sources=rag_response.sources,
            transcribed_question=transcribed_text
        )
