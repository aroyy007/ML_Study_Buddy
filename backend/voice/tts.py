# Text-to-Speech using HuggingFace SpeechT5
import torch
import scipy.io.wavfile as wav
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan

class TextToSpeech:
    """Text-to-speech using HuggingFace SpeechT5 with random speaker embedding."""

    def __init__(self):
        self._processor = None
        self._model = None
        self._vocoder = None
        self._speaker_embedding = None

    def _load_models(self):
        if self._model is None:
            print("🔄 Loading TTS model...")
            self._processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
            self._model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
            self._vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
            # Use a fixed random speaker embedding (works without external dataset)
            torch.manual_seed(42)
            self._speaker_embedding = torch.randn(1, 512)
            print("✅ TTS model loaded")

    @property
    def pipe(self):
        self._load_models()
        return self._model

    def synthesize(self, text: str, output_path: str = "output.wav") -> str:
        self._load_models()

        # Truncate text if too long (SpeechT5 has limits)
        if len(text) > 400:
            text = text[:400] + '...'

        # Process text
        inputs = self._processor(text=text, return_tensors="pt")

        # Generate speech
        speech = self._model.generate_speech(inputs["input_ids"], self._speaker_embedding, vocoder=self._vocoder)

        # Save to file
        wav.write(output_path, rate=16000, data=speech.numpy())
        return output_path
