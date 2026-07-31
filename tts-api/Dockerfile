FROM pytorch/pytorch:2.7.1-cuda12.6-cudnn9-runtime

WORKDIR /app

# System deps for audio
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy only what pip needs to resolve the editable install
COPY requirements.txt .
COPY app/tts ./app/tts

# Pip layer is now cached unless requirements.txt or the local package changes
RUN pip install --no-cache-dir -r requirements.txt

# Copy remaining source — changes here don't invalidate the pip layer
COPY . .

CMD ["python", "main.py"]
