"""
CareLens AI - Database Entity Schemas
Stores metadata and history entries securely without persisting raw patient retina images.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, JSON
from backend.app.models.database import Base

class ScreeningHistory(Base):
    __tablename__ = "screening_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    image_reference_id = Column(String, nullable=False)
    primary_condition = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence_pct = Column(Float, nullable=False)
    model_version = Column(String, default="1.0.0")
    language = Column(String, default="en")
    is_ungradable = Column(Boolean, default=False)

    # Explanation summary JSON payload
    explanation_summary = Column(JSON, nullable=True)

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    high_contrast = Column(Boolean, default=False)
    font_scale = Column(String, default="normal") # normal, large, xlarge
    language = Column(String, default="en")
    voice_enabled = Column(Boolean, default=False)
