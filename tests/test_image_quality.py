"""
CareLens AI - Image Quality Validation Tests
Verifies image validation rules, blur thresholds, resolution checks, and ungradable messaging.
"""

import pytest
import io
import numpy as np
from PIL import Image, ImageDraw
from ml.inference.quality_validator import ImageQualityValidator, UNGRADABLE_MESSAGE

def create_synthetic_fundus_bytes(width=300, height=300, main_color=(200, 45, 15)):
    img = Image.new("RGB", (width, height), color=(10, 5, 5))
    draw = ImageDraw.Draw(img)
    # Fundus body
    draw.ellipse((20, 20, width - 20, height - 20), fill=main_color)
    # Optic disc for spatial gradient & edge contrast
    draw.ellipse((width // 3, height // 3, width // 3 + 50, height // 3 + 50), fill=(255, 230, 150))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return buffer.getvalue()

def test_valid_fundus_like_image():
    validator = ImageQualityValidator()
    img_bytes = create_synthetic_fundus_bytes(300, 300, main_color=(200, 45, 15))
    res = validator.validate_image_bytes(img_bytes)
    assert res["is_valid"] is True
    assert res["is_ungradable"] is False

def test_low_resolution_rejection():
    validator = ImageQualityValidator(min_width=224, min_height=224)
    img_bytes = create_synthetic_fundus_bytes(100, 100, main_color=(200, 45, 15))
    res = validator.validate_image_bytes(img_bytes)
    assert res["is_valid"] is False
    assert res["is_ungradable"] is True
    assert res["user_message"] == UNGRADABLE_MESSAGE

def test_non_fundus_color_rejection():
    validator = ImageQualityValidator()
    # Blue dominant image (non-fundus)
    img_bytes = create_synthetic_fundus_bytes(300, 300, main_color=(10, 20, 220))
    res = validator.validate_image_bytes(img_bytes)
    assert res["is_valid"] is False
    assert res["is_ungradable"] is True
    assert res["user_message"] == UNGRADABLE_MESSAGE

def test_blank_black_image_rejection():
    validator = ImageQualityValidator()
    img = Image.new("RGB", (300, 300), color=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    res = validator.validate_image_bytes(buf.getvalue())
    assert res["is_valid"] is False
    assert res["is_ungradable"] is True
