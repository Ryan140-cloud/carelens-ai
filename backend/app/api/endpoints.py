"""
CareLens AI - REST API Endpoint Handlers
Implements clean REST contracts with file validation, error handling,
screening predictions, history management, and i18n support.
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.db_models import ScreeningHistory
from backend.app.models.schemas import (
    ScreeningResponse, QualityCheckResponse, ModelInfoResponse,
    HistoryCreateRequest, HistoryItemResponse, TranslationRequest, TranslationResponse, TTSRequest
)
from backend.app.core.security import validate_uploaded_file
from backend.app.services.ml_service import MLService
from backend.app.services.i18n_service import I18nService
from ml.models.screening_model import CLASS_LABELS

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "CareLens AI API",
        "version": "1.0.0",
        "medical_safety_positioning": "Screening & Decision-Support System Only"
    }

@router.get("/model-info", response_model=ModelInfoResponse, tags=["ML Model"])
async def get_model_info():
    import os, json
    metrics_path = "docs/metrics/evaluation_metrics.json"
    metrics_available = False
    metrics_data = None

    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r") as f:
                metrics_data = json.load(f)
                metrics_available = metrics_data.get("metrics_available", True)
        except Exception:
            metrics_available = False
            metrics_data = None

    return ModelInfoResponse(
        model_name="CareLens ScreeningNet (EfficientNet-B0)",
        version="1.1.0",
        dataset="ODIR-5K Retinal Fundus Benchmark",
        target_classes=CLASS_LABELS,
        input_resolution="224x224 RGB",
        metrics_available=metrics_available,
        metrics_summary=metrics_data.get("macro_metrics") if metrics_data else None,
        safety_disclaimer=(
            "CareLens AI is an AI-assisted decision support tool. It does NOT diagnose patients, "
            "replace doctors, or prescribe medication. All findings require professional evaluation."
        )
    )

@router.post("/image-quality", response_model=QualityCheckResponse, tags=["Screening"])
async def check_image_quality(file: UploadFile = File(...)):
    contents = await file.read()
    validate_uploaded_file(file.filename, file.content_type, len(contents))
    
    quality_result = MLService.validate_quality_only(contents)
    return QualityCheckResponse(
        is_valid=quality_result["is_valid"],
        is_ungradable=quality_result["is_ungradable"],
        user_message=quality_result["user_message"],
        reason=quality_result["reason"],
        metrics=quality_result.get("metrics", {})
    )

@router.post("/screen", response_model=ScreeningResponse, tags=["Screening"])
async def screen_retinal_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    validate_uploaded_file(file.filename, file.content_type, len(contents))

    try:
        result = MLService.screen_image(contents)

        # Optionally auto-record screening metadata to history
        if result["success"] and result["primary_finding"]:
            history_entry = ScreeningHistory(
                image_reference_id=f"IMG_{uuid.uuid4().hex[:8].upper()}",
                primary_condition=result["primary_finding"]["class_name"],
                risk_level=result["patient_friendly_explanation"]["risk_level"],
                confidence_pct=result["primary_finding"]["confidence_pct"],
                model_version="1.0.0",
                is_ungradable=False,
                explanation_summary=result["patient_friendly_explanation"]
            )
            db.add(history_entry)
            db.commit()

        return ScreeningResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while analyzing the image. Please verify the image file and try again."
        )

@router.get("/history", response_model=List[HistoryItemResponse], tags=["History"])
async def get_screening_history(db: Session = Depends(get_db)):
    items = db.query(ScreeningHistory).order_by(ScreeningHistory.created_at.desc()).limit(50).all()
    return items

@router.post("/history", response_model=HistoryItemResponse, tags=["History"])
async def create_history_record(record: HistoryCreateRequest, db: Session = Depends(get_db)):
    entry = ScreeningHistory(**record.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/history/{item_id}", tags=["History"])
async def delete_history_record(item_id: str, db: Session = Depends(get_db)):
    item = db.query(ScreeningHistory).filter(ScreeningHistory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History record not found.")
    db.delete(item)
    db.commit()
    return {"message": "Record deleted successfully.", "id": item_id}

@router.post("/translate", response_model=TranslationResponse, tags=["Accessibility & i18n"])
async def translate_text(req: TranslationRequest):
    translated = I18nService.translate(req.text, req.target_language)
    return TranslationResponse(
        original_text=req.text,
        translated_text=translated,
        target_language=req.target_language
    )

@router.post("/tts", tags=["Accessibility & i18n"])
async def text_to_speech_info(req: TTSRequest):
    return {
        "text": req.text,
        "language": req.language,
        "browser_speech_synthesis_supported": True,
        "message": "Use browser native SpeechSynthesis API for optimal client-side low-latency audio delivery."
    }
