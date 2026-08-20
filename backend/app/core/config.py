"""
CareLens AI - Configuration Settings Module
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareLens AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

    # CORS & Security
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "carelens-secret-key-change-in-production-2026")

    # Database (Using /tmp/carelens.db for cloud write safety)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/carelens.db")

    # ML & Inference Config
    MODEL_TYPE: str = os.getenv("MODEL_TYPE", "efficientnet_b0")
    MODEL_WEIGHTS_PATH: str = os.getenv("MODEL_WEIGHTS_PATH", "ml/checkpoints/carelens_efficientnet_b0.pt")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
    ENABLE_GRADCAM: bool = os.getenv("ENABLE_GRADCAM", "True").lower() in ("true", "1")

    # Multilingual & i18n
    DEFAULT_LANGUAGE: str = os.getenv("DEFAULT_LANGUAGE", "en")
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "pa"]

    class Config:
        case_sensitive = True

settings = Settings()
