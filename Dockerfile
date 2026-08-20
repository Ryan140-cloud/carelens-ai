FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source files
COPY backend /app/backend
COPY ml /app/ml
COPY docs /app/docs

# Set PYTHONPATH environment variable
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Command to launch Gunicorn + Uvicorn server bound to cloud PORT
CMD ["sh", "-c", "gunicorn backend.app.main:app -w 1 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}"]