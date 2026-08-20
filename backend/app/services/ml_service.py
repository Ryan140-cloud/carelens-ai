"""
CareLens AI - ML Service Layer
Wraps the PyTorch predictor and quality validator for backend endpoints.
Enforces strict checkpoint validation.
"""

from typing import Dict, Any
from ml.inference.predictor import CareLensPredictor

class MLService:
    _instance = None
    _init_error = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None and cls._init_error is None:
            try:
                cls._instance = CareLensPredictor()
            except Exception as e:
                cls._init_error = str(e)
                print(f"[MLService Error] Predictor initialization failed: {e}")
        return cls._instance

    @classmethod
    def screen_image(cls, image_bytes: bytes) -> Dict[str, Any]:
        predictor = cls.get_instance()
        if predictor is None:
            return {
                "success": False,
                "is_ungradable": True,
                "error_message": f"Trained CareLens model checkpoint unavailable. Screening is temporarily unavailable. ({cls._init_error})"
            }
        return predictor.predict(image_bytes)

    @classmethod
    def validate_quality_only(cls, image_bytes: bytes) -> Dict[str, Any]:
        predictor = cls.get_instance()
        if predictor is None:
            from ml.inference.quality_validator import ImageQualityValidator
            validator = ImageQualityValidator()
            return validator.validate_image_bytes(image_bytes)
        return predictor.validator.validate_image_bytes(image_bytes)
