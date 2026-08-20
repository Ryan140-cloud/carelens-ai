"""
CareLens AI - FastAPI Application Entrypoint
"""

import sys
import os

# Ensure project root is on sys.path for cloud deployment compatibility
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.security import SecurityHeadersMiddleware
from backend.app.models.database import engine, Base
from backend.app.api.endpoints import router as api_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "CareLens AI - AI-Assisted Early Eye-Health Screening Platform with Accessibility-First Design. "
        "Strictly operates as a preliminary screening decision-support tool."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# Apply Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Apply CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "title": "CareLens AI Server API",
        "tagline": "Detect Earlier. Understand Better. Act Sooner.",
        "status": "Online",
        "health_check": "/api/health",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
