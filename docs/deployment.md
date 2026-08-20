# CareLens AI - Deployment Guide

## Deployment Options

CareLens AI supports containerized deployment via Docker Compose or standalone execution.

---

## Option 1: Docker Compose (Recommended)

Run the full stack (FastAPI Backend + React Frontend + PostgreSQL):

```bash
docker-compose up --build
```

- Frontend UI: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

## Option 2: Local Development Execution

### 1. Backend Setup
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI dev server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env`:
```env
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite:///./carelens.db
CORS_ORIGINS=["http://localhost:5173"]
MODEL_TYPE=efficientnet_b0
CONFIDENCE_THRESHOLD=0.45
```
