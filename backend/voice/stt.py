# Speech-to-Text using HuggingFace Whisper
import torch
from transformers import pipeline

class SpeechToText:
    """Speech-to-text using HuggingFace Whisper."""

    def __init__(self):
        self._pipe = None

    @property
    def pipe(self):
        if self._pipe is None:
            print("🔄 Loading Whisper model...")
            self._pipe = pipeline(
                "automatic-speech-recognition",
                model="openai/whisper-small",
                device="cuda" if torch.cuda.is_available() else "cpu"
            )
            print("✅ Whisper model loaded")
        return self._pipe

    def transcribe(self, audio_path: str) -> str:
        result = self.pipe(audio_path)
        return result["text"]
