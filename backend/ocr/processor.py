# OCR Module for Image Text Extraction
import io
from pathlib import Path
from typing import Optional
from PIL import Image

class OCRProcessor:
    """OCR processor using HuggingFace TrOCR for text extraction from images."""
    
    SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.gif'}
    
    def __init__(self):
        self._model = None
        self._processor = None
        self._device = None
    
    def _load_model(self):
        """Lazy load the OCR model."""
        if self._model is not None:
            return
        
        try:
            import torch
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel
            
            print("Loading OCR model (TrOCR)...")
            
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            model_name = "microsoft/trocr-base-printed"
            
            self._processor = TrOCRProcessor.from_pretrained(model_name)
            self._model = VisionEncoderDecoderModel.from_pretrained(model_name).to(self._device)
            
            print(f"OCR model loaded on {self._device}")
        except Exception as e:
            print(f"Failed to load OCR model: {e}")
            self._model = None
            self._processor = None
    
    @staticmethod
    def is_supported(filename: str) -> bool:
        """Check if the file format is supported."""
        ext = Path(filename).suffix.lower()
        return ext in OCRProcessor.SUPPORTED_FORMATS
    
    def extract_text_from_image(self, image: Image.Image) -> str:
        """Extract text from a PIL Image using OCR."""
        self._load_model()
        
        if self._model is None or self._processor is None:
            return ""
        
        try:
            import torch
            
            # Ensure image is in RGB mode
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # For better OCR results, we process the image in chunks if it's large
            # TrOCR works best on single lines of text
            # For full page OCR, we'll process the whole image
            
            # Process with TrOCR
            pixel_values = self._processor(image, return_tensors="pt").pixel_values.to(self._device)
            
            with torch.no_grad():
                generated_ids = self._model.generate(pixel_values, max_length=512)
            
            text = self._processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            return text.strip()
        except Exception as e:
            print(f"OCR extraction failed: {e}")
            return ""
    
    def extract_text_from_bytes(self, image_bytes: bytes) -> str:
        """Extract text from image bytes."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return self.extract_text_from_image(image)
        except Exception as e:
            print(f"Failed to process image bytes: {e}")
            return ""
    
    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from an image file."""
        try:
            image = Image.open(file_path)
            return self.extract_text_from_image(image)
        except Exception as e:
            print(f"Failed to process image file: {e}")
            return ""


# Global OCR instance (lazy loaded)
_ocr_instance: Optional[OCRProcessor] = None

def get_ocr() -> OCRProcessor:
    """Get the global OCR processor instance."""
    global _ocr_instance
    if _ocr_instance is None:
        _ocr_instance = OCRProcessor()
    return _ocr_instance
