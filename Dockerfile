FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including ffmpeg for audio, git-lfs for large files
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libsndfile1 \
    git \
    git-lfs \
    && rm -rf /var/lib/apt/lists/* \
    && git lfs install

# Copy requirements and install Python dependencies
COPY requirements-hf.txt .
RUN pip install --no-cache-dir -r requirements-hf.txt

# Install huggingface_hub for downloading LFS files
RUN pip install huggingface_hub

# Copy application code
COPY app.py .
COPY backend/ ./backend/

# Copy faiss_index folder (will contain LFS pointers initially)
COPY faiss_index/ ./faiss_index/

# Create a non-root user for security
RUN useradd -m -u 1000 user
USER user

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Expose the port HF Spaces expects
EXPOSE 7860

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
