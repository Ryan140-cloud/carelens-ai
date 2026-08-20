"""
CareLens AI - Backend REST API End-to-End Tests
"""

import pytest
import io
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def create_test_fundus_bytes():
    img = Image.new("RGB", (300, 300), color=(10, 5, 5))
    draw = ImageDraw.Draw(img)
    draw.ellipse((20, 20, 280, 280), fill=(190, 45, 20))
    draw.ellipse((90, 140, 150, 200), fill=(255, 230, 150))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Screening" in data["medical_safety_positioning"]

def test_model_info_endpoint():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "ODIR-5K" in data["dataset"]
    assert len(data["target_classes"]) == 8

def test_image_quality_check_endpoint():
    img_bytes = create_test_fundus_bytes()
    response = client.post(
        "/api/image-quality",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "is_valid" in data

def test_screening_endpoint():
    img_bytes = create_test_fundus_bytes()
    response = client.post(
        "/api/screen",
        files={"file": ("retina_test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["patient_friendly_explanation"] is not None

def test_history_endpoints():
    response = client.get("/api/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_translate_endpoint():
    response = client.post(
        "/api/translate",
        json={"text": "Start Screening", "target_language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["translated_text"] == "नेत्र जांच शुरू करें"
