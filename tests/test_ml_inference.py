"""
CareLens AI - ML Inference & Grad-CAM Tests
"""

import pytest
import io
from PIL import Image, ImageDraw
from ml.inference.predictor import CareLensPredictor

def create_sample_image_bytes():
    img = Image.new("RGB", (300, 300), color=(10, 5, 5))
    draw = ImageDraw.Draw(img)
    draw.ellipse((20, 20, 280, 280), fill=(180, 50, 20))
    draw.ellipse((90, 140, 150, 200), fill=(255, 230, 150))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_predictor_full_pipeline():
    predictor = CareLensPredictor()
    img_bytes = create_sample_image_bytes()
    res = predictor.predict(img_bytes)

    assert res["success"] is True
    assert res["is_ungradable"] is False
    assert len(res["all_class_probabilities"]) == 8
    assert res["patient_friendly_explanation"] is not None
    assert "CareLens AI is an AI-assisted screening" in res["patient_friendly_explanation"]["medical_disclaimer"]
