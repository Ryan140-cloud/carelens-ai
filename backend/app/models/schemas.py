"""
CareLens AI - Pydantic Request & Response Validation Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class QualityCheckResponse(BaseModel):
    is_valid: bool
    is_ungradable: bool
    user_message: str
    reason: str
    metrics: Dict[str, Any] = {}

class ClassProbability(BaseModel):
    class_name: str
    short_code: str = "N"
    probability: float = 0.0
    confidence_pct: float = 0.0
    is_positive: bool = False

class PatientExplanation(BaseModel):
    finding_title: str
    risk_level: str
    primary_condition: Optional[str] = "Retinal Finding"
    confidence_display: Optional[str] = "Screening Result"
    patient_friendly_summary: str
    recommended_next_step: str
    gradcam_explanation: Optional[str] = "Visual heatmap highlights region of highest AI activation."
    medical_disclaimer: str

class ScreeningResponse(BaseModel):
    success: bool = True
    is_ungradable: bool = False
    quality_check: QualityCheckResponse
    primary_finding: Optional[ClassProbability] = None
    all_class_probabilities: Optional[List[ClassProbability]] = None
    gradcam_data_url: Optional[str] = None
    patient_friendly_explanation: Optional[PatientExplanation] = None
    model_metadata: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

class HistoryCreateRequest(BaseModel):
    image_reference_id: str
    primary_condition: str
    risk_level: str
    confidence_pct: float
    model_version: str = "1.0.0"
    language: str = "en"
    is_ungradable: bool = False
    explanation_summary: Optional[Dict[str, Any]] = None

class HistoryItemResponse(BaseModel):
    id: str
    created_at: datetime
    image_reference_id: str
    primary_condition: str
    risk_level: str
    confidence_pct: float
    model_version: str
    language: str
    is_ungradable: bool
    explanation_summary: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ModelInfoResponse(BaseModel):
    model_name: str = "CareLens ScreeningNet (EfficientNet-B0)"
    version: str = "1.1.0"
    dataset: str = "ODIR-5K Retinal Fundus Benchmark"
    target_classes: List[str]
    input_resolution: str = "224x224 RGB"
    metrics_available: bool = False
    metrics_summary: Optional[Dict[str, Any]] = None
    safety_disclaimer: str

class TranslationRequest(BaseModel):
    text: str
    target_language: str # en, hi, pa

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
